import {
  ArrowLeft,
  Bot,
  CheckCircle,
  Copy,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import CommonMarkdownRenderer from "./CommonMarkdownRenderer";
import { submitToLLM } from "../services/apiSelector";
import { useStore } from "../store/useStore";
import type { ChatMessage } from "../types";
import type { RACEComponents } from "../types/race";
import { copyToClipboard } from "../utils/clipboard";
import { generateId } from "../utils/generateId";
import { Modal } from "./Modal";

interface CodeBlockDetails {
  language: string;
  content: string;
  fileName: string;
  extension: string;
}

interface ErrorDetails {
  message: string;
  timestamp: string;
  context?: string;
}

interface PreviewPageProps {
  content: string;
  onBack: () => void;
  onCopy: () => void;
  isOpen: boolean;
  showCopySuccess?: boolean;
}

interface ChatHistoryState {
  conversationId: string;
  messages: ChatMessage[];
}

interface ChatState {
  messages: ChatMessage[];
  conversationId: string;
}

const createErrorDetails = (error: unknown, context?: string): ErrorDetails => {
  return {
    message:
      error instanceof Error ? error.message : "An unexpected error occurred",
    timestamp: new Date().toISOString(),
    context,
  };
};

const Header = ({
  onBack,
  onCopy,
  copySuccess,
  title,
}: {
  onBack: () => void;
  onCopy: () => void;
  copySuccess: boolean;
  title: string;
}) => (
  <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 bg-vscode-panel">
    <div className="flex items-center gap-2">
      <button
        onClick={onBack}
        className="p-2.5 rounded-sm text-vscode-fg hover:text-vscode-fg hover:bg-vscode-list-hover"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h3 className="text-lg font-medium text-vscode-fg">{title}</h3>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={onCopy}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xs transition-colors ${
          copySuccess
            ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            : "hover:bg-vscode-list-hover text-vscode-fg"
        }`}
        aria-label={copySuccess ? "Copied to clipboard" : "Copy to clipboard"}
      >
        {copySuccess ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  </div>
);

const extractRACEComponents = (content: string): RACEComponents => {
  if (!content || typeof content !== 'string') {
    console.error('Invalid content provided to extractRACEComponents:', content);
    throw new Error('Invalid content provided');
  }

  const components: RACEComponents = {
    role: '',
    action: '',
    context: '',
    execute: ''
  };

  try {
    console.log('Attempting to parse content:', content.substring(0, 200) + '...');
    
    const sectionPattern = /### (Role|Action|Context|Execute):[\r\n]+((?:(?!### [A-Za-z]+:)[\s\S])*)/gm;
    
    let match;
    let foundSections = [];
    
    while ((match = sectionPattern.exec(content)) !== null) {
      const type = match[1].toLowerCase() as keyof RACEComponents;
      const value = match[2].trim();
      components[type] = value;
      foundSections.push(type);
      
      console.log(`Found section: ${type}`);
      console.log(`Content preview: ${value.substring(0, 50)}...`);
    }

    console.log('Found sections:', foundSections);
    console.log('Current components state:', components);

    if (!components.role || !components.action) {
      const missingComponents = [];
      if (!components.role) missingComponents.push('Role');
      if (!components.action) missingComponents.push('Action');
      
      console.error(
        'Missing required RACE components:',
        missingComponents.join(', '),
        '\nContent structure:',
        content.split('\n').slice(0, 10).join('\n') + '...'
      );
      throw new Error(`Required RACE components not found: ${missingComponents.join(', ')}`);
    }

    return components;
  } catch (error) {
    console.error('Error extracting RACE components:', {
      error,
      contentPreview: content.substring(0, 500) + '...',
      contentLength: content.length,
      sections: content.match(/### [A-Za-z]+:/g)
    });
    throw new Error(`Could not extract RACE components: ${error.message}`);
  }
};

const extractFormatRequirements = (content: string) => {
  const requirements = {
    language: "",
    format: "general" as const,
    context: "",
  };

  const lines = content.split("\n");
  for (const line of lines) {
    if (line.startsWith("# Programming Language")) {
      requirements.language = line.replace("# Programming Language", "").trim();
    } else if (line.startsWith("# Context:")) {
      requirements.context = line.replace("# Context:", "").trim();
    }
  }

  return requirements;
};

export const detectFileDetails = (
  content: string,
  language: string
): { fileName: string; extension: string } => {
  const defaultExtensions = {
    typescript: "ts",
    javascript: "js",
    python: "py",
    java: "java",
    cpp: "cpp",
    c: "c",
    ruby: "rb",
    php: "php",
    html: "html",
    css: "css",
    json: "json",
    yaml: "yaml",
    markdown: "md",
    text: "txt",
    xml: "xml",
    csv: "csv",
    ini: "ini",
    toml: "toml",
    properties: "properties",
    feature: "feature",
    featurefile: "feature",
    gherkin: "feature",
    sql: "sql",
    rust: "rs",
    go: "go",
    kotlin: "kt",
    swift: "swift",
    dart: "dart",
    scala: "scala",
    shell: "sh",
    powershell: "ps1",
    dockerfile: "dockerfile",
    terraform: "tf",
  };
  const sanitizeFileName = (name: string): string => {
    return name
      .toLowerCase()
      .split(/[^a-z0-9]+/g).filter(Boolean).join('_')
      .replace(/^_/, '')
      .replace(/_$/, '')
      .substring(0, 50);
  };

  const generateSmartName = (content: string, language: string): string => {

    if (
      language.toLowerCase() === "gherkin" ||
      language.toLowerCase() === "feature"
    ) {
      const featureRegex = /Feature:\s*([^\n]+)/;
      const featureMatch = featureRegex.exec(content);
      if (featureMatch) {
        return `feature_${sanitizeFileName(featureMatch[1])}`;
      }

      const scenarioMatch = /Scenario:?\s*([^\n]+)/.exec(content);
      if (scenarioMatch) {
        return `scenario_${sanitizeFileName(scenarioMatch[1])}`;
      }

      return `bdd_scenario_${generateId().substring(0, 8)}`;
    }

    const lines = content.split("\n");
    let detectedName = "";

    const fileNameCommentRegex = /(?:\/\/|#|\*|--|<!--)\s*(?:filename|file):\s*([^\s]+)/i;
    const fileNameComment = lines.find((line) => fileNameCommentRegex.exec(line));
    if (fileNameComment) {
      const match = fileNameCommentRegex.exec(fileNameComment);
      if (match) return sanitizeFileName(match[1]);
    }

    const patterns: { [key: string]: RegExp } = {
      typescript:
        /(?:class|interface|function|const)\s+([a-zA-Z_$]\w*)/,
      javascript: /(?:class|function|const)\s+([a-zA-Z_$]\w*)/,
      python: /(?:class|def)\s+([a-zA-Z_]\w*)/,
      java: /(?:class|interface|enum)\s+([a-zA-Z_$]\w*)/,
      ruby: /(?:class|module|def)\s+([a-zA-Z_]\w*)/,
      go: /(?:func|type)\s+([a-zA-Z_]\w*)/,
      rust: /(?:fn|struct|enum)\s+([a-zA-Z_]\w*)/,
      php: /(?:class|function)\s+([a-zA-Z_]\w*)/,
    };

    if (patterns[language.toLowerCase()]) {
      const match = patterns[language.toLowerCase()].exec(content);
      if (match) {
        detectedName = match[1];
      }
    }

    if (!detectedName) {
      const firstMeaningfulLine = lines.find(
        (line) =>
          line.trim() &&
          !line.trim().startsWith("//") &&
          !line.trim().startsWith("/*") &&
          !line.trim().startsWith("*")
      );

      if (firstMeaningfulLine) {
        detectedName = firstMeaningfulLine
          .trim()
          .split(/[\s({]/)[0]
          .replace(/[^\w\s-]/g, "");
      }
    }

    if (detectedName) {
      const prefix = getLanguagePrefix(language);
      return `${prefix}_${sanitizeFileName(detectedName)}`;
    }

    const shortId = generateId().substring(0, 6);
    const prefix = getLanguagePrefix(language);
    return `${prefix}_${shortId}`;
  };

  const getLanguagePrefix = (language: string): string => {
    const prefixMap: { [key: string]: string } = {
      typescript: "ts",
      javascript: "js",
      python: "py",
      java: "java",
      ruby: "rb",
      gherkin: "bdd",
      feature: "bdd",
      sql: "sql",
      rust: "rs",
      go: "go",
      kotlin: "kt",
      swift: "swift",
      dart: "dart",
      scala: "scala",
      shell: "sh",
      powershell: "ps",
      dockerfile: "docker",
      terraform: "tf",
    };
    return (
      prefixMap[language.toLowerCase()] ||
      language.toLowerCase().substring(0, 3)
    );
  };

  const smartName = generateSmartName(content, language);
  const extension = defaultExtensions[language.toLowerCase()] ?? "txt";

  if (smartName.endsWith(`.${extension}`)) {
    const nameWithoutExt = smartName.slice(0, -(extension.length + 1));
    return {
      fileName: nameWithoutExt,
      extension,
    };
  }

  return {
    fileName: smartName,
    extension,
  };
};

export const downloadCode = (content: string, fileName: string, extension: string) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};


interface RenderContentProps {
  content: string;
}

const RenderContent: React.FC<RenderContentProps> = ({ content }) => (
  <div className="prose prose-sm dark:prose-invert prose-pre:bg-transparent dark:text-gray-200 max-w-none">
    <CommonMarkdownRenderer content={content} />
  </div>
);

export const PreviewPage = ({
  content,
  onBack,
  onCopy,
  isOpen,
  showCopySuccess,
}: PreviewPageProps) => {
  const { isAdmin } = useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [llmResponse, setLlmResponse] = useState<string | null>(null);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [llmCopySuccess, setLlmCopySuccess] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isProcessingContent, setIsProcessingContent] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout>();
  const processingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleError = useCallback((error: unknown, context?: string) => {
    const errorDetails = createErrorDetails(error, context);
    setError(errorDetails);
    console.error("PreviewPage Error:", errorDetails);
  }, []);

  const handleSubmitToLLM = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setIsProcessingContent(true);

      if (!content || typeof content !== "string") {
        toast.error("Invalid content provided");
        return;
      }

      let raceComponents;
      try {
        raceComponents = extractRACEComponents(content);
      } catch (error) {
        console.error("Failed to extract RACE components:", error);
        toast.error("Could not extract RACE components from the content");
        return;
      }

      if (!raceComponents?.role || !raceComponents?.action) {
        toast.error("Missing required RACE components (Role and Action)");
        return;
      }

      const sections = content.split(/###\s+/);
      const customSections: { [key: string]: string } = {};
      let programmingLanguage = "";

      const sectionRegex = /^([^:\n]+):\s*([\s\S]+)/;
      sections.forEach((section) => {
        const sectionMatch = sectionRegex.exec(section);
        if (sectionMatch) {
          const [_, title, content] = sectionMatch;
          if (title.trim() === "Programming Language") {
            programmingLanguage = content.trim();
          } else if (
            !["Role", "Action", "Context", "Execute"].includes(title.trim())
          ) {
            customSections[title.trim()] = content.trim();
          }
        }
      });

      const systemContext = `You are an AI assistant with the following context:

Role:
${raceComponents.role}

Action:
${raceComponents.action}

Context:
${raceComponents.context ?? "No specific context provided"}

Execute:
${raceComponents.execute ?? "No specific execution steps provided"}

${Object.entries(customSections)
  .map(
    ([title, content]) => `
${title}:
${content}
`
  )
  .join("\n")}

${
  programmingLanguage
    ? `Programming Language: ${programmingLanguage}

Note: Please ensure all code examples and responses are in ${programmingLanguage} unless specifically requested otherwise.`
    : ""
}

Please maintain this context while assisting with any questions or tasks. Your responses should:
1. Align with the specified role and expertise
2. Follow the action guidelines
3. Consider all provided context, including custom sections
4. Follow the execution steps
${
  programmingLanguage
    ? `5. Use ${programmingLanguage} for code examples unless otherwise specified`
    : ""
}`;

      try {
        const timestamp = new Date().toLocaleTimeString();
        setLlmResponse(`### Assistant Response (${timestamp})\n`);

        const response = await submitToLLM(systemContext, {
          temperature: 0.7,
          maxTokens: 2000,
        });

        const chunks = response.split(" ");
        let accumulatedResponse = "";

        for (const chunk of chunks) {
          await new Promise((resolve) => setTimeout(resolve, 10)); 
          accumulatedResponse += chunk + " ";
          setLlmResponse(
            `### Assistant Response (${timestamp})\n${accumulatedResponse}`
          );
        }

      } catch (err) {
        console.error("Error in LLM submission:", err);
        handleError(err, "Failed to get response from AI");
        toast.error("Failed to process the content");
      }
    } catch (err) {
      console.error("Error in handleSubmitToLLM:", err);
      handleError(err, "Failed to process the request");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
      setIsProcessingContent(false);
    }
  };

  useEffect(() => {
    return () => {
      copyTimeoutRef.current && clearTimeout(copyTimeoutRef.current);
      processingTimeoutRef.current &&
        clearTimeout(processingTimeoutRef.current);
      setLlmResponse(null);
    };
  }, []);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseLLMResponse();
      if (e.key === "Enter" && e.ctrlKey) handleSubmitToLLM();
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  const handleCloseLLMResponse = useCallback(() => {
    setLlmResponse(null);
    onBack();
  }, [onBack]);

  const handleCopy = useCallback(async () => {
    try {
      const success = await copyToClipboard(content);
      if (success) {
        setCopySuccess(true);
        onCopy();
        copyTimeoutRef.current = setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error("Copy failed:", error);
      handleError(error, "Copy operation failed");
    }
  }, [content, onCopy]);

  const handleCopyCode = useCallback(async (text: string) => {
    try {
      const success = await copyToClipboard(text);
      if (success) {
        setLlmCopySuccess(true);
        setTimeout(() => setLlmCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error("Copy code failed:", error);
      handleError(error, "Copy code operation failed");
    }
  }, []);

interface HandleUpdateContentProps {
  content: string;
  llmResponse: string | null;
  setIsThinking: React.Dispatch<React.SetStateAction<boolean>>;
  setStreamingResponse: React.Dispatch<React.SetStateAction<string>>;
  setResponseChunks: React.Dispatch<React.SetStateAction<string[]>>;
  setLlmResponse: React.Dispatch<React.SetStateAction<string | null>>;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

const handleUpdateContent = async (
  userInput: string,
  {
    content,
    llmResponse,
    setIsThinking,
    setLlmResponse,
    chatContainerRef,
  }: Omit<HandleUpdateContentProps, 'setStreamingResponse' | 'setResponseChunks'>
) => {
  try {
    setIsThinking(true);

    let raceComponents;
    try {
      raceComponents = extractRACEComponents(content);
    } catch (error) {
      console.error("Failed to extract RACE components:", error);
      toast.error("Could not extract RACE components from the content");
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const userMessage = `### User Message (${timestamp})\n${userInput}`;

    setLlmResponse((prev) => {
      if (!prev) return userMessage;
      return `${prev}\n\n---\n\n${userMessage}`;
    });

    const promptWithContext = `You are an AI assistant with the following context:

Role:
${raceComponents.role}

Action:
${raceComponents.action}

Context:
${raceComponents.context ?? "No specific context provided"}

Execute:
${raceComponents.execute ?? "No specific execution steps provided"}

Previous conversation:
${llmResponse}

User question: ${userInput}

Please provide a response that:
1. Aligns with your role as ${raceComponents.role.split("\n")[0]}
2. Follows the action guidelines
3. Considers the given context
4. Follows the execution steps
5. Directly addresses the user's question`;

    setLlmResponse(
      (prev) => `${prev}\n\n### Assistant Response (${timestamp})\n`
    );

    const response = await submitToLLM(promptWithContext, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const chunks = response.split(" ");
    let accumulatedResponse = "";

    for (const chunk of chunks) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      accumulatedResponse += chunk + " ";
      setLlmResponse((prev) => {
        const parts = prev.split(`### Assistant Response (${timestamp})\n`);
        return `${parts[0]}### Assistant Response (${timestamp})\n${accumulatedResponse}`;
      });
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  } catch (error) {
    console.error("Error getting response:", error);
    toast.error("Failed to get AI response");
  } finally {
    setIsThinking(false);
  }
};


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setChatInput((prev) => `${prev}\n\nFile Content:\n${content}`);
      };
      reader.readAsText(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (isOpen && content) {
      copyToClipboard(content)
        .then((success) => {
          if (success) {
            setCopySuccess(true);
            onCopy();
            copyTimeoutRef.current = setTimeout(
              () => setCopySuccess(false),
              2000
            );
          }
        })
        .catch((error) => {
          console.error("Failed to auto-copy:", error);
          handleError(error, "Auto-copy failed");
        });
    }
  }, [isOpen, content, onCopy]);


  const handleBack = useCallback(() => {
    if (llmResponse) {
      setLlmResponse(null);
    } else {
      onBack();
    }
  }, [llmResponse, onBack]);

  const handleClose = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      className="w-screen h-screen max-w-screen max-h-screen overflow-visible font-sans bg-gray-50 dark:bg-vscode-editor-background"
      title=""
      hideHeader={true}
    >
      <div className="relative flex flex-col h-screen">
   
        <Header
          onBack={handleBack}
          onCopy={llmResponse ? () => handleCopyCode(llmResponse) : handleCopy}
          copySuccess={llmResponse ? llmCopySuccess : copySuccess}
          title="Preview"
        />


        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto p-2 space-y-6">
      
      <div className="bg-vscode-panel border border-vscode-border rounded-sm text-vscode-fg">
              {isProcessingContent ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                </div>
              ) : (
                <div className="p-2"><RenderContent content={content} /></div>
              )}
            </div>

     
            {isAdmin && (
              <div className="flex justify-end border-t border-vscode-border pt-4">
                <button
                  onClick={handleSubmitToLLM}
                  disabled={isSubmitting}
                  className={`
                    px-4 py-2 text-sm bg-vscode-button text-vscode-button-fg rounded-sm
                    hover:bg-vscode-button-hover focus:outline-none focus:ring-1 focus:ring-vscode-active
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2
                  `}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-current border-r-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
              </div>
            )}

            {llmResponse && (
              <div className="bg-vscode-panel border border-vscode-border rounded-sm mt-6">
                <div className="border-b border-vscode-border px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-vscode-fg" />
                    <h3 className="text-sm font-medium text-vscode-fg">
                      AI Response & Chat
                    </h3>
                  </div>
                  <button
                    onClick={() => handleCopyCode(llmResponse)}
                    className={`
                      flex items-center gap-1.5 px-2 py-1 text-xs rounded-sm
                      ${
                        llmCopySuccess
                          ? "bg-vscode-button/20 text-vscode-button-fg"
                          : "hover:bg-vscode-list-hover text-vscode-fg hover:text-vscode-fg"
                      }
                    `}
                  >
                    {llmCopySuccess ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative flex flex-col h-[600px]">

                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-2 space-y-4"
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                      <CommonMarkdownRenderer content={llmResponse ?? ""} />
                      {isThinking && (
                        <div className="flex items-center gap-1 text-vscode-fg mt-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                          <div
                            className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <div
                            className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

               
                  <div className="border-t border-vscode-border bg-vscode-panel p-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!chatInput.trim() || isThinking) return;
                        handleUpdateContent(
                          chatInput,
                          {
                            content,
                            llmResponse,
                            setIsThinking,
                            setLlmResponse,
                            chatContainerRef,
                          }
                        );
                        setChatInput("");
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="max-w-3xl mx-auto space-y-2"
                    >
          
                      {selectedFile && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-vscode-section border border-vscode-border rounded-sm">
                          <Paperclip className="w-4 h-4 text-vscode-fg" />
                          <span className="text-sm text-vscode-fg truncate">
                            {selectedFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="ml-auto p-1 hover:bg-vscode-list-hover rounded-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                    
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full px-3 py-2 text-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border rounded-sm
                              placeholder-vscode-input-fg/50 focus:outline-none focus:border-vscode-active focus:ring-1 focus:ring-vscode-active"
                          />
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".txt,.md,.json,.yaml,.xml,.csv"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-vscode-fg hover:text-vscode-fg hover:bg-vscode-list-hover rounded-sm"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || isThinking}
                          className="px-4 py-2 text-sm bg-vscode-button text-vscode-button-fg rounded-sm hover:bg-vscode-button-hover
                            disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
                        >
                          {isThinking ? (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                              <div
                                className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                              <div
                                className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                                style={{ animationDelay: "0.4s" }}
                              />
                            </div>
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}


            {error && (
              <div className="absolute top-16 right-4 m-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 max-w-md">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error.message}
                    </p>
                    <span className="text-xs text-red-500 dark:text-red-300">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-full transition-colors ml-2"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PreviewPage;
