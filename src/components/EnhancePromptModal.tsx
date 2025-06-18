const MarkdownCodeBlock = ({ inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className ?? '');
  if (!inline && match) {
    return (
      <SyntaxHighlighter
        language={match[1]}
        style={tomorrow}
        PreTag="div"
        customStyle={{
          margin: 0,
          background: 'var(--vscode-editor-background)',
          padding: '1rem',
        }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  }
  return <code className={className} {...props}>{children}</code>;
};
const LoadingIndicator = () => (
  <div className="flex items-center gap-1 text-vscode-fg mt-4">
    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }} />
    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.4s' }} />
  </div>
);
import React, { useState, useCallback, useRef } from 'react';
const MarkdownCodeComponent = (props: any) => <MarkdownCodeBlock {...props} />;
import { Modal } from './Modal';
import { Send, X, Copy, CheckCircle, Download, ChevronDown, Bot, Paperclip } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { config } from '../config';
import { submitToLLM } from '../services/apiSelector';
import { useStore } from '../store/useStore';
import { ChatMessage } from '../types';
import { copyToClipboard } from '../utils/clipboard';

export interface EnhancePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (enhancedPrompt: string) => void;
  currentPrompt?: string;
}

interface ChatHistoryState {
  messages: ChatMessage[];
  conversationId: string;
}

interface CodeBlock {
  language: string;
  content: string;
  fileName: string;
  extension: string;
}

interface RACEComponents {
  role: string;
  action: string;
  context: string;
  execute: string;
}

interface ErrorDetails {
  message: string;
  timestamp: string;
  context?: string;
}

const createErrorDetails = (error: unknown, context?: string): ErrorDetails => {
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    context
  };
};

const generateUniqueId = () => `enhance-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1)).toString().slice(2, 11)}`;

const getFileExtension = (language: string): string => {
  const extensionMap: { [key: string]: string } = {
    gherkin: '.feature',
    python: '.py',
    javascript: '.js',
    typescript: '.ts',
    ruby: '.rb',
    csharp: '.cs',
    java: '.java',
    csv: '.csv'
  };
  return extensionMap[language.toLowerCase()] ?? '.txt';
};

const getSmartFileName = (language: string, content: string): string => {
  const firstLine = content.split('\n')[0].trim();
  
  if (language.toLowerCase() === 'gherkin') {
    const featureRegex = /Feature:\s*([^\n]{0,1000})(?:\n|$)/;
    const featureMatch = featureRegex.exec(content);
    const featureName = featureMatch 
      ? featureMatch[1].trim().replace(/[^a-zA-Z0-9]/g, '')
      : 'FeatureTests';
    return `${featureName}.feature`;
  } else {
    const defaultName = firstLine
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 30) ?? 'script';
    return `${defaultName}${getFileExtension(language)}`;
  }
};

const handleCopyCode = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
    } catch (err) {
    console.error('Failed to copy code:', err);
    return false;
  }
};

const handleDownloadCode = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const CodeBlockCard = ({ block, onCopy, onDownload }: {
  block: CodeBlock;
  onCopy: (content: string) => void;
  onDownload: (content: string, fileName: string) => void;
}) => {


    return (
    <div className="relative mt-4 first:mt-0">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100/50 dark:bg-gray-800/50">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {block.fileName}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onCopy(block.content)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Copy code"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(block.content, block.fileName)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <SyntaxHighlighter
          language={block.language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            background: 'transparent',
            padding: '1rem',
          }}
        >
          {block.content}
        </SyntaxHighlighter>
      </div>
      </div>
    );
  };

const extractRACEComponents = (content: string): RACEComponents => {
  const components: RACEComponents = {
    role: '',
    action: '',
    context: '',
    execute: ''
  };

  const sections = content.split(/^#\s{0,5}(?:Role|Action|Context|Execute):\s{0,20}$/im);
  
  for (let i = 1; i < sections.length; i += 2) {
    const sectionName = sections[i].toLowerCase();
    const sectionContent = sections[i+1]?.trim() ?? '';
    components[sectionName as keyof RACEComponents] = sectionContent;
  }

  return components;
};

export const buildSystemPrompt = async (prompt: string, isChat: boolean = false) => {
  const searchContext = `
    [Relevant GDS context, standards, and guidelines]
    - Government Digital Service (GDS) standards and best practices
    - Digital, Data and Technology (DDaT) Capability framework
    - Service Standard points
    - Accessibility requirements (WCAG 2.2)
    - Security standards and compliance
    - User-centered design principles
    - Plain English Campaign principles
    - GDS Technology Code of Practice
    - GDS Digital Delivery Assurance Playbook
    - A Blueprint for Modern Digital Government
    - State of Digital Government Review
    - GDS Service Manual
    - GDS Design System
    - GDS Analytics Platform
    - GDS Performance Platform
  `;

  const optimizationSteps = `
    1. Analyze the prompt for clarity, specificity, and completeness
    2. Identify key expertise and specializations required for the role
    3. Break down actions into detailed, measurable steps
    4. Provide comprehensive context with standards and requirements
    5. Create detailed execution steps with clear deliverables
    6. Ensure alignment with GDS standards and DDaT Capability framework
    7. Structure using enhanced RACE framework with expertise focus
    8. Review and refine for clarity and actionability
    9. Validate against GDS compliance requirements
  `;

  const raceFramework = `
    RACE Framework Integration with Enhanced Detail:

    R - Defines who is performing the action, aligning with Government Digital Service (GDS) guidelines for digital service teams. This includes the title, area of expertise, responsibilities, and how they contribute to the service lifecycle. Consider these examples based on common GDS roles:
        - Product Manager: You are a Product Manager responsible for defining the vision and roadmap for a new digital service. You ensure the service aligns with organizational priorities and meets user needs. You collaborate with stakeholders, prioritize features, and manage the product backlog.
        - Service Owner: You are the Service Owner accountable for the overall development, operation, and continuous improvement of the digital service. You represent the service during assessments and ensure adherence to project and approval processes.
        - Delivery Manager: You are a Delivery Manager responsible for setting up and maintaining the agile delivery environment. You remove impediments, facilitate team collaboration, and empower the team to self-organize and deliver iteratively.
        - User Researcher: You are a User Researcher tasked with understanding user needs and behaviors through various research methods. You ensure the service is user-centered and accessible to all users, including those with disabilities. You communicate research findings to the team and inform design decisions.
        - Content Designer: You are a Content Designer crafting clear, concise, and user-friendly content for the digital service. You ensure the content meets user needs, is accessible, and adheres to style guidelines.
        - Developer: You are a Developer building and iterating the software for the service. You write code, conduct testing, and ensure the service meets technical and user requirements. You collaborate with other developers and follow agile development practices.
        - Technical Architect: You are a Technical Architect defining the overall technical architecture of the service. You ensure it is scalable, secure, maintainable, and aligned with business needs and technical standards.
        - Quality Assurance Tester: You are a Quality Assurance Tester responsible for ensuring the quality of the digital service. You conduct various tests, including functional, performance, security, and usability testing, to identify and report defects.

    A - Action: Specifies the task to be performed, incorporating GDS guidance and deliverables relevant to each role. This includes the objective, specific actions, deliverables, methodologies, and adherence to relevant standards.
        - Product Manager: Define the product vision and roadmap for a new digital service, ensuring alignment with the GDS Service Standard and the Digital Delivery Assurance Playbook. Deliverables include a prioritized backlog, user stories, and acceptance criteria.
        - Service Owner: Oversee the development, operation, and continuous improvement of the service, adhering to the GDS Service Standard and Delivery Guardrails. Deliverables include a service strategy, performance metrics, and risk management plans.
        - Delivery Manager: Facilitate agile delivery, removing impediments and empowering the team to deliver iteratively, following Agile methodologies and the GDS Service Standard. Deliverables include sprint plans, retrospectives, and progress reports.  
        - User Researcher: Conduct user research to understand user needs and ensure the service meets accessibility requirements, following the GDS Service Standard and Government Accessibility Requirements. Deliverables include user personas, journey maps, and research reports.
        - Content Designer: Create clear and concise content according to GDS Content Design Guidance and Plain English Campaign principles. Deliverables include content drafts, style guides, and content audits.
        - Developer: Build and iterate the service's software, adhering to the GDS Technology Code of Practice and Security by Design principles. Deliverables include source code, technical documentation, and automated tests.
        - Technical Architect: Define the technical architecture, ensuring scalability, security, and maintainability, aligned with GDS Technical Architecture Principles and the Digital Delivery Assurance Playbook. Deliverables include architecture diagrams and technical specifications.
        - Quality Assurance Tester: Ensure service quality by conducting various tests, including functional, performance, security, and usability testing, following GDS Quality Assurance Guidelines and Testing Best Practices. Deliverables include test plans, test execution reports, and defect logs.
      This refined definition of "Action" emphasizes not just what needs to be done but also how it should be done, referencing specific GDS guidelines and expected deliverables.

    C - Context: Provides the background information necessary to understand the task, specifically referencing relevant UK government digital service guidelines and resources. This includes the project goals, user needs, technical constraints, relevant policies, and any other pertinent information.

      Examples:
        - Developing a new online service for claiming benefits: The project aims to create a user-friendly online service for citizens to claim benefits. Adherence to the GDS Service Standard is crucial, with a focus on accessibility (Government Accessibility Requirements) and security (Cyber Security Guidelines). The service must integrate with existing government systems. Refer to the Digital, Data and Technology Playbook for best practices.
        - Improving an existing government website: The goal is to improve the usability and accessibility of an existing government website. The redesign must comply with the GDS Service Standard and Government Accessibility Requirements. User research data is available and should inform design decisions. The Technology Code of Practice should guide technical implementation.
        - Assuring the delivery of a digital project: This project focuses on assuring the successful delivery of a new digital service. The Digital Delivery Assurance Playbook and Delivery Guardrails provide the framework for this assurance process. The assessment should consider all aspects of the service, from user needs to technical implementation and security.
        - Modernizing legacy government systems: This project involves modernizing legacy government systems to improve efficiency and service delivery. The A Blueprint for Modern Digital Government provides the overarching vision and strategy. Consider the Technology Code of Practice when selecting and implementing new technologies. The State of Digital Government Review offers insights into current challenges and best practices.

    E - Execute: The execute steps for each role, considering the actions they may undertake:
        Product Manager
          -Action: Define product vision and roadmap
          -Execution Steps:
            -Conduct market research and user interviews
            -Prioritize features and create a product backlog
            -Develop a product roadmap with milestones
            -Communicate vision to stakeholders and team
        Service Owner
          -Action: Ensure service performance and compliance
          -Execution Steps:
            -Monitor service performance metrics
            -Conduct regular risk assessments
            -Ensure compliance with regulations and standards
            -Report on service status to stakeholders
        Delivery Manager
          -Action: Facilitate agile project management
          -Execution Steps:
            -Plan and facilitate sprint ceremonies (planning, reviews, retrospectives)
            -Track and remove impediments for the team
            -Monitor team progress and update dashboards
            -Ensure continuous improvement through retrospectives
        User Researcher
          -Action: Conduct user research
          -Execution Steps:
            -Plan and design research studies
            -Recruit participants and conduct interviews/tests
          -Analyze data and synthesize insights
          -Present findings to the team
        Content Designer
          -Action: Create user-centered content
          -Execution Steps:
            -Conduct content audits and user research
            -Write and edit content to meet user needs
            -Collaborate with designers and developers for implementation
        Designer
          -Action: Develop user interfaces and experiences
          -Execution Steps:
            -Create wireframes and mockups
            -Develop interactive prototypes
            -Conduct usability testing and gather feedback
            -Iterate on designs based on user feedback
        Developer
          -Action: Build and deploy software
          -Execution Steps: 
            -Write and review code
            -Implement automated tests
            -Deploy code to staging and production environments
            -Monitor and resolve any production issues
        Performance Analyst
          -Action: Measure and analyze service performance
          -Execution Steps:
            -Define key performance indicators (KPIs)
            -Collect and analyze performance data
            -Create performance reports and dashboards
            -Provide recommendations for improvement
        Business Analyst
          -Action: Analyze business needs and requirements
          -Execution Steps:
            -Conduct stakeholder interviews and workshops
            -Document business requirements and process flows
            -Analyze gaps and propose solutions
            -Communicate requirements to the development team
        Cyber Security Professional
          -Action: Ensure service security
          -Execution Steps:
            -Conduct security assessments and audits
            -Identify and mitigate vulnerabilities
            -Develop and implement security policies
            -Monitor security incidents and respond accordingly

        Technical Architect
          -Action: Define technical architecture
          -Execution Steps:
            -Analyze business and technical requirements
            -Design system architecture and create diagrams
            -Develop technical specifications and documentation
            -Oversee implementation and ensure alignment with architecture
        DevOps Engineer
          -Action: Automate and streamline development processes
          -Execution Steps:
            -Implement Infrastructure as Code (IaC)
            -Configure continuous integration/continuous deployment (CI/CD) pipelines
            -Set up monitoring and alerting systems
            -Respond to and resolve incidents

        Quality Assurers and Testers
          -Action: Ensure service quality through testing
          -Execution Steps:
            -Develop test plans and test cases
            -Execute tests and document results
            -Report and track defects
            -Automate tests and continuously improve test coverage
    These steps provide a structured approach to executing actions and ensuring the successful delivery of digital public services.
      - Avoid ambiguous or vague instructions that can lead to unclear responses.
      - Avoid including irrelevant details that do not contribute to the expected outcome.
      - Avoid overly complex or lengthy prompts.
      - Avoid asking to perform tasks outside its capabilities, such as performing physical actions or accessing private data.
      - Use clear and concise language to specify the desired outcome.
  `;

  return `You are an expert prompt engineer for the UK Government Digital Service (GDS). Your task is to enhance the given prompt through a multi-step process:

1. First, consider this context:
${searchContext}

2. Then, apply this optimization process: 
${optimizationSteps}

3. Finally, ensure the optimized prompt follows the enhanced RACE framework while maintaining GDS compliance:
${raceFramework}

Process the following prompt through all steps and present the final enhanced version that meets all GDS standards and requirements:

[USER PROMPT CONTEXT]
${prompt}

[PROMPT TO ENHANCE]
${prompt}

When defining the Role, ensure you include:
1. Clear specialization and expertise areas


Please format your response using the following template, including the headers for each RACE component:

### Template : [Template Name]  

### Description : [Description of the prompt]

### Role:
[includes the title, area of expertise, responsibilities, and how they contribute to the service lifecycle]

### Action:
[Specifies the task to be performed, incorporating GDS guidance and deliverables relevant to each role. This includes the objective, specific actions, deliverables, methodologies, and adherence to relevant standards.
This refined definition of "Action" emphasizes not just what needs to be done but also how it should be done, referencing specific GDS guidelines and expected deliverables.]

### Context:
[Provides the background information necessary to understand the task, specifically referencing relevant UK government digital service guidelines and resources. This includes the project goals, user needs, technical constraints, relevant policies, and any other pertinent information.]

### Execute:
[These steps provide a structured approach to executing actions and ensuring the successful delivery of digital public services
- Avoid ambiguous or vague instructions that can lead to unclear responses.
- Avoid including irrelevant details that do not contribute to the expected outcome.
- Avoid overly complex or lengthy prompts.
- Avoid asking to perform tasks outside its capabilities, such as performing physical actions or accessing private data.
- Use clear and concise language to specify the desired outcome.

Fine-tune the prompt by iterating and refining it based on the responses received, ensuring consistent, accurate and relevant output.]

Only provide the response in the above format, without any additional text or explanation.`;
};

const styles = `
  @keyframes gradient-x {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes spin-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse-ring {
    0% { transform: scale(0.7); opacity: 0; }
    50% { transform: scale(1); opacity: 0.5; }
    100% { transform: scale(1.3); opacity: 0; }
  }

  @keyframes particle-float {
    0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) rotate(360deg); opacity: 0; }
  }

  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 3s linear infinite;
  }
  
  .animate-spin-reverse {
    animation: spin-reverse 1s linear infinite;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-pulse-ring {
    animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  }

  .particle {
    position: absolute;
    pointer-events: none;
    animation: particle-float 1s ease-out forwards;
  }

  .border-3 {
    border-width: 3px;
  }

  .enhance-button-processing {
    position: relative;
    overflow: hidden;
  }

  .enhance-button-processing::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      #60a5fa 72deg,
      transparent 144deg,
      transparent 216deg,
      #60a5fa 288deg,
      transparent 360deg
    );
    animation: spin-reverse 4s linear infinite;
  }

  .enhance-button-processing::after {
    content: '';
    position: absolute;
    inset: 2px;
    background: #1d4ed8;
    border-radius: 0.5rem;
    z-index: 1;
  }

  .particle-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  @keyframes pulse-ring {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }

  @keyframes loading-dots {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  @keyframes spin-glow {
    0% { transform: rotate(0deg); box-shadow: 0 0 10px rgba(59, 130, 246, 0.4); }
    100% { transform: rotate(360deg); box-shadow: 0 0 10px rgba(59, 130, 246, 0.4); }
  }

  .professional-button {
    background: linear-gradient(180deg, #2563eb, #1d4ed8);
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .professional-button:hover:not(:disabled) {
    background: linear-gradient(180deg, #1d4ed8, #1e40af);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  .professional-button:disabled {
    background: linear-gradient(180deg, #93c5fd, #60a5fa);
    cursor: not-allowed;
  }

  .professional-button-processing {
    background: linear-gradient(180deg, #1e40af, #1d4ed8);
    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .loading-ring {
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin-glow 1s linear infinite;
  }

  .loading-dot {
    animation: loading-dots 1.4s infinite;
  }

  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export const EnhancePromptModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentPrompt = ''
}: EnhancePromptModalProps) => {
  const [inputPrompt, setInputPrompt] = useState(currentPrompt);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [llmCopySuccess, setLlmCopySuccess] = useState(false);
  const [isInputSectionExpanded, setIsInputSectionExpanded] = useState(true);
  useStore();
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [llmResponse, setLlmResponse] = useState<string | null>(null);





  const handleCopyCode = async (text: string) => {
    try {
      const success = await copyToClipboard(text);
      if (success) {
        setLlmCopySuccess(true);
        setTimeout(() => setLlmCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Copy code failed:', error);
      toast.error('Failed to copy code');
    }
  };

  const handleError = useCallback((error: unknown, context?: string) => {
    const errorDetails = createErrorDetails(error, context);
    console.error('EnhancePromptModal Error:', errorDetails);
  }, []);

  const formatRaceComponentsPrompt = (raceComponents: RACEComponents) => {
    return `### Role
${raceComponents.role.trim()}

### Action
${raceComponents.action.trim()}

### Context
${raceComponents.context.trim()}

### Execute
${raceComponents.execute.trim()}`;
  };

  const updateEnhancedPromptChunks = async (text: string) => {
    const chunks = text.split('\n');
    let accumulatedResponse = '';
    
    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 15));
      accumulatedResponse += chunk + '\n';
      setEnhancedPrompt(accumulatedResponse);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!inputPrompt.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setEnhancedPrompt('');
    
    try {
      const systemPrompt = await buildSystemPrompt(inputPrompt, false);
      const timestamp = new Date().toLocaleTimeString();
      setEnhancedPrompt(`Generating enhanced prompt... (${timestamp})\n`);

      const response = await submitToLLM(systemPrompt, { 
        temperature: 0.7, 
        maxTokens: 2000,
        model: 'gpt-4'
      });
      
      const raceComponents = extractRACEComponents(response);

      if (raceComponents.role && raceComponents.action && raceComponents.context && raceComponents.execute) {
        const formattedPrompt = formatRaceComponentsPrompt(raceComponents);
        await updateEnhancedPromptChunks(formattedPrompt);
      } else {
        await updateEnhancedPromptChunks(response);
      }

      setIsInputSectionExpanded(false);
    } catch (error) {
      console.error('Error in handleEnhancePrompt:', error);
      handleError(error, 'Failed to enhance prompt');
      if (error.message.includes('content policy')) {
        toast.error('Content policy violation. Please rephrase your prompt to be more professional.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to enhance prompt');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setChatInput(prev => `${prev}\n\nFile Content:\n${content}`);
      };
      reader.readAsText(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateContent = useCallback(async (messageContent: string) => {
    try {
      setIsThinking(true);    
      console.log('Azure OpenAI Configuration:', {
        key: config.AZURE_OPENAI_KEY ? 'Present' : 'Missing',
        endpoint: config.AZURE_OPENAI_ENDPOINT,
        deploymentId: config.AZURE_OPENAI_DEPLOYMENT_ID
      });

      let raceComponents;
      try {
        raceComponents = extractRACEComponents(enhancedPrompt);
      } catch (error) {
        console.error('Failed to extract RACE components:', error);
        toast.error('Could not extract RACE components from the content');
        return;
      }
      
      const timestamp = new Date().toLocaleTimeString();
      const userMessage = `### User Message (${timestamp})\n${messageContent}`;
      
      setLlmResponse(prev => {
        if (!prev) return userMessage;
        return `${prev}\n\n---\n\n${userMessage}`;
      });

      const promptWithContext = `You are an AI assistant with the following context:

Enhanced Prompt:
${enhancedPrompt}

Role:
${raceComponents.role}

Action:
${raceComponents.action}

Context:
${raceComponents.context ?? 'No specific context provided'}

Execute:
${raceComponents.execute ?? 'No specific execution steps provided'}

Previous conversation:
${llmResponse ?? ''}

User question: ${messageContent}

Please provide a response that:
1. Aligns with the enhanced prompt context
2. Follows the role and action guidelines
3. Considers all provided context
4. Follows the execution steps
5. Maintains consistency with previous responses`;

      setLlmResponse(prev => `${prev}\n\n### Assistant Response (${timestamp})\n`);

      try {
        const response = await submitToLLM(promptWithContext, {
          temperature: 0.7,
          maxTokens: 2000,
          model: 'gpt-4'
        });

        const chunks = response.split(' ');
        let accumulatedResponse = '';

        for (const chunk of chunks) {
          await new Promise(resolve => setTimeout(resolve, 10)); 
          accumulatedResponse += chunk + ' ';
          setLlmResponse(prev => {
            const parts = prev.split(`### Assistant Response (${timestamp})\n`);
            return `${parts[0]}### Assistant Response (${timestamp})\n${accumulatedResponse}`;
          });
        }

        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }

      } catch (error) {
        console.error('Error getting response:', error);
        if (error.message.includes('content policy')) {
          toast.error('Content policy violation. Please rephrase your message to be more professional.');
        } else {
          handleError(error, 'Failed to get AI response');
          toast.error(error instanceof Error ? error.message : 'Failed to get AI response');
        }
      }
    } catch (error) {
      console.error('Error in handleUpdateContent:', error);
      handleError(error, 'Failed to process the request');
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsThinking(false);
    }
  }, [enhancedPrompt, llmResponse, chatContainerRef]);

  const handleChatSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isThinking) return;

    const messageContent = chatInput;
    setChatInput('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    await handleUpdateContent(messageContent);
  }, [chatInput, isThinking, handleUpdateContent, fileInputRef]);

  const handleClose = useCallback(() => {
    setInputPrompt('');
    setEnhancedPrompt('');
    onClose();
  }, [onClose]);

  const handleCopy = async () => {
    if (!enhancedPrompt) return;
    
    try {
      const success = await copyToClipboard(enhancedPrompt);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        toast.success('Copied to clipboard');
      } else {
        toast.error('Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy to clipboard');
      setCopySuccess(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      className="w-screen h-screen max-w-screen max-h-screen overflow-visible font-sans bg-gray-50 dark:bg-vscode-editor-background"
      title="Enhance Prompt"
      hideHeader={true}
    >
      <div className="flex flex-col h-screen bg-vscode-panel">
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-vscode-border bg-vscode-panel">
          <h2 className="text-base font-medium text-vscode-fg">Enhance Prompt</h2>
          <button
            onClick={handleClose}
            className="p-2.5 rounded-sm text-vscode-fg hover:text-vscode-fg hover:bg-vscode-list-hover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
          <div className="max-w-3xl mx-auto p-2 space-y-6">
            <div className="space-y-2">
          <button
            onClick={() => setIsInputSectionExpanded(!isInputSectionExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 bg-vscode-section border border-vscode-border rounded-sm hover:border-vscode-active group"
          >
                <span className="text-sm font-medium text-vscode-fg">Input Prompt</span>
                <ChevronDown className={`w-4 h-4 text-vscode-fg group-hover:text-vscode-fg transition-transform ${
              isInputSectionExpanded ? 'rotate-180' : ''
            }`} />
          </button>
          
          {isInputSectionExpanded && (
                <div className="bg-vscode-section border border-vscode-border rounded-sm p-2 space-y-4">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Enter your prompt to enhance..."
                    className="w-full h-32 px-3 py-2 text-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border rounded-sm resize-none
                      placeholder-vscode-input-fg/50 focus:outline-none focus:border-vscode-active focus:ring-1 focus:ring-vscode-active"
              />
                  <div className="flex justify-end">
                <button
                  onClick={handleEnhancePrompt}
                  disabled={isSubmitting || !inputPrompt.trim()}
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
                      <span>Enhancing...</span>
                    </div>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
            {enhancedPrompt && (
              <div className="bg-vscode-section border border-vscode-border rounded-sm">
                <div className="border-b border-vscode-border px-4 py-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-vscode-fg">Enhanced Prompt</h3>
                  <button
                    onClick={handleCopy}
                    className={`
                      flex items-center gap-1.5 px-2 py-1 text-xs rounded-sm
                      ${copySuccess 
                        ? 'bg-vscode-button/20 text-vscode-button-fg' 
                        : 'hover:bg-vscode-list-hover text-vscode-fg hover:text-vscode-fg'
                      }
                    `}
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <span><Copy className="w-3.5 h-3.5" /> Copy</span>
                    )}
                  </button>
                </div>
                <div className="p-2">
                  <ReactMarkdown
                    className="prose prose-sm dark:prose-invert max-w-none"
                    components={{
                      code: MarkdownCodeComponent
                    }}
                  >
                    {enhancedPrompt}
                  </ReactMarkdown>
                  {isSubmitting && <LoadingIndicator />}
                </div>
              </div>
            )}
            {llmResponse && (
              <div className="bg-vscode-section border border-vscode-border rounded-sm mt-6">
                <div className="border-b border-vscode-border px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-vscode-fg" />
                    <h3 className="text-sm font-medium text-vscode-fg">AI Response & Chat</h3>
                  </div>
                  <button
                    onClick={() => handleCopyCode(llmResponse)}
                    className={`
                      flex items-center gap-1.5 px-2 py-1 text-xs rounded-sm
                      ${llmCopySuccess 
                        ? 'bg-vscode-button/20 text-vscode-button-fg' 
                        : 'hover:bg-vscode-list-hover text-vscode-fg hover:text-vscode-fg'
                      }
                    `}
                  >
                    {llmCopySuccess ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <span><Copy className="w-3.5 h-3.5" /> Copy</span>
                    )}
                  </button>
                </div>
                <div className="relative flex flex-col h-[600px]">
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-2 space-y-4"
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                      <ReactMarkdown
                        components={{
                          code: MarkdownCodeComponent
                        }}
                      >
                        {llmResponse}
                      </ReactMarkdown>
                  {isThinking && <LoadingIndicator />}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
          {enhancedPrompt && (
          <div className="border-t border-vscode-border bg-vscode-panel p-4">
            <form onSubmit={handleChatSubmit} className="max-w-3xl mx-auto space-y-2">
              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-vscode-section border border-vscode-border rounded-sm">
                  <Paperclip className="w-4 h-4 text-vscode-fg" />
                  <span className="text-sm text-vscode-fg truncate">{selectedFile.name}</span>
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
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
                  ) : (
                    <Send className="w-4 h-4" />
          )}
                </button>
        </div>
            </form>
          </div>
        )}

      </div>
    </Modal>
  );
};

EnhancePromptModal.displayName = 'EnhancePromptModal';

export default EnhancePromptModal;