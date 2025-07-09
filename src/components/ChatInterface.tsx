import { Paperclip, Send, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { submitChatMessage } from '../services/apiSelector';
import { ChatMessage } from '../types';
import type { RACEComponents } from '../types/race';
import { MessageButton } from './MessageButton';

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


const SESSION_TIMEOUT = 60 * 60 * 1000;
const KEEP_ALIVE_INTERVAL = 15 * 60 * 1000;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MESSAGES_PER_PAGE = 20;
const DEBOUNCE_DELAY = 500;

const DDAT_FRAMEWORK = {
  roles: {
    'technical_architect': {
      level: 'Lead',
      race: {
        role: 'Lead Technical Architect responsible for system design and technical standards compliance',
        action: 'Design and oversee technical architecture while ensuring compliance with GDS standards',
        context: 'Work within GDS technical architecture principles and DDaT capability framework',
        execute: 'Implement and maintain technical standards using approved tools and methodologies'
      },
      skills: ['technical architecture', 'system design', 'security architecture'],
      standards: ['Technology Code of Practice', 'Service Standard', 'ISO 27001']
    },
    'business_analyst': {
      level: 'Senior',
      race: {
        role: 'Senior Business Analyst responsible for requirements gathering, analysis, and documentation',
        action: 'Analyze business needs, document requirements, and ensure alignment with GDS service standards',
        context: 'Work within GDS service assessment framework and agile delivery methodology',
        execute: 'Facilitate workshops, create user stories, and maintain requirements traceability'
      },
      skills: [
        'requirements engineering',
        'stakeholder management',
        'process modeling',
        'user research analysis',
        'service design',
        'agile methodologies'
      ],
      standards: [
        'GDS Service Standard',
        'Business Analysis Framework',
        'IIBA BABOK Guide',
        'Agile BA Framework'
      ],
      deliverables: {
        documentation: [
          'Business requirements documents',
          'User stories and acceptance criteria',
          'Process flow diagrams',
          'User journey maps',
          'Service blueprints'
        ],
        analysis: [
          'Gap analysis',
          'Impact assessments',
          'Requirements traceability matrix',
          'User needs analysis',
          'Service assessment reports'
        ],
        collaboration: [
          'Stakeholder engagement plans',
          'Workshop facilitation',
          'Cross-functional team coordination',
          'Requirements validation sessions'
        ],
        quality: [
          'Requirements quality metrics',
          'Documentation standards compliance',
          'User story quality checks',
          'Acceptance criteria validation'
        ]
      }
    },
    'software_developer': {
      level: 'Senior',
      race: {
        role: 'Senior Software Developer focusing on code quality, security, and best practices',
        action: 'Develop, test, and maintain high-quality software following GDS and SonarQube standards',
        context: 'Work within GDS development standards, modern practices, and security guidelines',
        execute: 'Write clean, testable code while ensuring quality metrics, security, and accessibility standards are met'
      },
      skills: [
        'full-stack development',
        'clean code practices',
        'test-driven development',
        'security-first development',
        'accessibility implementation',
        'API development',
        'cloud-native development',
        'continuous integration'
      ],
      standards: [
        'SonarQube Standards',
        'OWASP Security Standards',
        'WCAG 2.2 Accessibility',
        'GDS Service Standard',
        'Clean Code Principles'
      ],
      deliverables: {
        code_quality: [
          'Clean, maintainable code',
          'Comprehensive unit tests',
          'Integration tests',
          'API documentation',
          'Technical documentation'
        ],
        security: [
          'Secure coding patterns',
          'Security testing',
          'Vulnerability assessments',
          'Security documentation'
        ],
        accessibility: [
          'WCAG 2.2 compliant features',
          'Accessibility testing',
          'Screen reader support',
          'Keyboard navigation'
        ],
        development: [
          'Feature implementation',
          'Bug fixes and patches',
          'Code reviews',
          'Performance optimizations',
          'Technical debt reduction'
        ]
      }
    },
    'devops_engineer': {
      level: 'Senior',
      race: {
        role: 'Senior DevOps Engineer responsible for CI/CD, infrastructure, and operational excellence',
        action: 'Design, implement and maintain robust CI/CD pipelines and cloud infrastructure',
        context: 'Work within GDS cloud-first principles, security standards, and operational requirements',
        execute: 'Implement automation, monitoring, and infrastructure as code while ensuring security and reliability'
      },
      skills: [
        'CI/CD pipeline design',
        'infrastructure as code',
        'cloud architecture',
        'container orchestration',
        'automation',
        'monitoring and observability',
        'security operations',
        'performance optimization'
      ],
      standards: [
        'GDS Cloud Security Principles',
        'ISO 27001',
        'NCSC Cloud Security',
        'DevSecOps Framework',
        'SRE Principles'
      ],
      deliverables: {
        infrastructure: [
          'Infrastructure as Code templates',
          'Cloud architecture designs',
          'Security configurations',
          'Disaster recovery plans',
          'Environment specifications'
        ],
        automation: [
          'CI/CD pipelines',
          'Deployment automation',
          'Testing automation',
          'Security scanning integration',
          'Monitoring automation'
        ],
        operations: [
          'Monitoring dashboards',
          'Alert configurations',
          'Runbooks and playbooks',
          'Performance metrics',
          'Capacity planning'
        ],
        security: [
          'Security controls implementation',
          'Compliance automation',
          'Security monitoring',
          'Access management',
          'Vulnerability management'
        ]
      }
    },
    'qa_tester': {
      level: 'Senior',
      race: {
        role: 'Senior QA Engineer ensuring comprehensive testing coverage',
        action: 'Design and implement testing strategies across all testing phases',
        context: 'Operate within GDS testing framework and quality standards',
        execute: 'Conduct thorough testing using approved methodologies and tools'
      },
      skills: ['quality assurance', 'test automation', 'accessibility testing'],
      standards: ['ISO 29119', 'ISTQB', 'WCAG 2.2']
    },
    'test_engineer': {
      level: 'Senior',
      race: {
        role: 'Senior Test Engineer responsible for test strategy, automation, and quality assurance',
        action: 'Design, implement and maintain comprehensive test frameworks and strategies',
        context: 'Work within GDS testing standards, accessibility requirements, and security compliance',
        execute: 'Develop and execute test plans, automate test cases, and ensure quality metrics are met'
      },
      skills: [
        'test automation',
        'performance testing',
        'security testing',
        'accessibility testing',
        'API testing',
        'continuous testing',
        'test framework development'
      ],
      standards: [
        'ISO/IEC 29119',
        'ISTQB Advanced Level',
        'GDS Testing Standards',
        'WCAG 2.2',
        'OWASP Testing Guide'
      ],
      deliverables: {
        strategy: [
          'Test strategy documentation',
          'Test coverage metrics',
          'Risk-based test plans',
          'Test environment specifications',
          'Tool selection and framework architecture'
        ],
        automation: [
          'Automated test suites',
          'CI/CD pipeline integration',
          'Test data management',
          'Cross-browser testing',
          'Mobile testing frameworks'
        ],
        quality_metrics: [
          'Code coverage reports',
          'Test execution metrics',
          'Defect density analysis',
          'Performance benchmarks',
          'Accessibility compliance reports'
        ],
        testing_types: {
          functional: [
            'Unit testing',
            'Integration testing',
            'System testing',
            'End-to-end testing',
            'Regression testing'
          ],
          non_functional: [
            'Performance testing',
            'Security testing',
            'Accessibility testing',
            'Usability testing',
            'Compatibility testing'
          ],
          specialized: [
            'API testing',
            'Database testing',
            'Mobile testing',
            'Cloud testing',
            'Microservices testing'
          ]
        }
      }
    }
  },
  standards: {
    code_quality: {
      sonarqube: {
        reliability: [
          'Zero critical or blocker issues',
          'Maintain reliability rating at A',
          'Address all code smells promptly',
          'No duplicate blocks of code (DRY principle)'
        ],
        security: [
          'Zero security hotspots',
          'Maintain security rating at A',
          'No vulnerable dependencies',
          'Regular security scanning'
        ],
        maintainability: [
          'Maintain code coverage above 80%',
          'Technical debt ratio below 5%',
          'Documentation for all public APIs',
          'Follow clean code principles'
        ],
        performance: [
          'CPU usage optimization',
          'Memory leak prevention',
          'Efficient database queries',
          'Response time optimization'
        ]
      },
      security: [
        'OWASP Top 10 compliance',
        'Regular penetration testing',
        'Secure coding practices',
        'Security-first design approach'
      ],
      accessibility: [
        'WCAG 2.2 Level AA compliance',
        'Automated accessibility testing',
        'Regular accessibility audits',
        'Inclusive design patterns'
      ]
    },
    business_analysis: {
      requirements: [
        'Clear and unambiguous requirements documentation',
        'SMART acceptance criteria',
        'Complete traceability matrix',
        'Regular stakeholder validation'
      ],
      process: [
        'Standardized documentation templates',
        'Version control for all artifacts',
        'Regular requirements reviews',
        'Change impact analysis'
      ],
      quality: [
        'Requirements quality checklist',
        'Peer review process',
        'Stakeholder sign-off',
        'Regular quality audits'
      ],
      governance: [
        'Alignment with GDS standards',
        'Compliance with data protection',
        'Accessibility considerations',
        'Security requirements integration'
      ]
    },
    testing: {
      automation: [
        'Maintainable and scalable test frameworks',
        'Page Object Model implementation',
        'Data-driven testing approach',
        'Behavior-driven development (BDD)',
        'Continuous testing integration'
      ],
      quality_gates: [
        'Minimum 80% test coverage',
        'Zero critical defects in production',
        'All high-priority tests automated',
        'Performance benchmarks met',
        'Accessibility compliance verified'
      ],
      best_practices: [
        'Test pyramid implementation',
        'Shift-left testing approach',
        'Risk-based testing strategy',
        'Regular test maintenance',
        'Cross-browser compatibility'
      ],
      reporting: [
        'Automated test reports',
        'Defect trending analysis',
        'Coverage metrics tracking',
        'Performance monitoring',
        'Accessibility compliance status'
      ],
      tools: {
        automation: [
          'Selenium WebDriver',
          'Cypress',
          'Playwright',
          'Jest',
          'TestCafe'
        ],
        performance: [
          'JMeter',
          'K6',
          'Gatling',
          'Artillery',
          'LoadRunner'
        ],
        accessibility: [
          'Axe',
          'WAVE',
          'Lighthouse',
          'NVDA',
          'VoiceOver'
        ],
        api: [
          'Postman',
          'REST Assured',
          'SoapUI',
          'Karate',
          'Pact'
        ],
        security: [
          'OWASP ZAP',
          'Burp Suite',
          'Acunetix',
          'Netsparker',
          'Checkmarx'
        ]
      }
    },
    development: {
      code_standards: [
        'Clean code principles adherence',
        'SOLID principles implementation',
        'Design patterns usage',
        'Code documentation standards',
        'API design standards'
      ],
      testing: [
        'Unit testing coverage > 80%',
        'Integration testing coverage',
        'E2E testing implementation',
        'Performance testing baselines',
        'Security testing integration'
      ],
      practices: [
        'Test-Driven Development',
        'Pair programming',
        'Code review process',
        'Continuous refactoring',
        'Technical debt management'
      ],
      tools: {
        ide: ['VS Code', 'IntelliJ', 'Eclipse'],
        version_control: ['Git', 'GitHub', 'GitLab'],
        ci_tools: ['Jenkins', 'GitHub Actions', 'Azure DevOps'],
        quality: ['SonarQube', 'ESLint', 'Prettier']
      }
    },
    devops: {
      infrastructure: [
        'Infrastructure as Code implementation',
        'Cloud-native architecture',
        'Container orchestration',
        'Microservices patterns',
        'Service mesh implementation'
      ],
      automation: [
        'CI/CD pipeline automation',
        'Testing automation',
        'Security scanning automation',
        'Deployment automation',
        'Configuration management'
      ],
      monitoring: [
        'Application performance monitoring',
        'Infrastructure monitoring',
        'Log aggregation',
        'Alerting and notification',
        'Metrics collection'
      ],
      security: [
        'DevSecOps practices',
        'Security scanning integration',
        'Compliance automation',
        'Secret management',
        'Access control implementation'
      ],
      tools: {
        cloud: ['AWS', 'Azure', 'GCP'],
        containers: ['Docker', 'Kubernetes', 'Helm'],
        monitoring: ['Prometheus', 'Grafana', 'ELK Stack'],
        automation: ['Terraform', 'Ansible', 'Puppet'],
        security: ['Vault', 'Twistlock', 'Aqua']
      }
    }
  }
};

const getRaceContext = (role: string): RACEComponents | null => {
  const roleConfig = DDAT_FRAMEWORK.roles[role as keyof typeof DDAT_FRAMEWORK.roles];
  if (!roleConfig?.race) return null;

  return {
    role: roleConfig.race.role,
    action: roleConfig.race.action,
    context: roleConfig.race.context,
    execute: roleConfig.race.execute
  };
};

const buildStandardsContext = (role: string) => {
  const raceContext = getRaceContext(role);
  const sonarqubeStandards = DDAT_FRAMEWORK.standards.code_quality.sonarqube;

  return `
RACE Framework Context:
${raceContext ? `
Role: ${raceContext.role}
Action: ${raceContext.action}
Context: ${raceContext.context}
Execute: ${raceContext.execute}
` : ''}

Standards and Compliance Requirements:

1. Code Quality (SonarQube):
   Reliability:
   ${sonarqubeStandards.reliability.map(std => `   - ${std}`).join('\n')}
   
   Security:
   ${sonarqubeStandards.security.map(std => `   - ${std}`).join('\n')}
   
   Maintainability:
   ${sonarqubeStandards.maintainability.map(std => `   - ${std}`).join('\n')}
   
   Performance:
   ${sonarqubeStandards.performance.map(std => `   - ${std}`).join('\n')}

2. Security Standards:
${DDAT_FRAMEWORK.standards.code_quality.security.map(std => `   - ${std}`).join('\n')}

3. Accessibility Requirements:
${DDAT_FRAMEWORK.standards.code_quality.accessibility.map(std => `   - ${std}`).join('\n')}

DDaT Capability Framework Alignment:
${Object.entries(DDAT_FRAMEWORK.roles)
  .map(([roleName, details]) => 
    `- ${roleName.replace('_', ' ').toUpperCase()}:
   Level: ${details.level}
   Skills: ${details.skills.join(', ')}
   Standards: ${details.standards.join(', ')}`
  ).join('\n')}`;
};

interface ChatInterfaceProps {
  conversationId: string;
  initialContent: string;
  onUpdateContent?: (content: string | ((prev: string) => string)) => void;
  messages?: ChatMessage[];
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
  className?: string;
}

interface MessageGroup {
  id: string;
  messages: ChatMessage[];
  timestamp: string;
}

export const ChatInterface = ({ 
  conversationId, 
  initialContent,
  onUpdateContent,
  messages = [],
  onMessagesUpdate,
  className = '' 
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout>();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const resetSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    const timeout = setTimeout(() => {

      console.log('Chat session timed out');
    }, 30 * 60 * 1000); 
    setSessionTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [sessionTimeout]);

  const updateLastActivity = () => {
    setLastActivity(Date.now());
    resetSessionTimeout();
  };

  useEffect(() => {
    const setupKeepAlive = () => {
      const keepAliveInterval = setInterval(() => {
        const inactiveTime = Date.now() - lastActivity;
        if (inactiveTime > 25 * 60 * 1000) { 
          console.log('Sending keep-alive');
          updateLastActivity();
        }
      }, 60 * 1000); 

      return () => clearInterval(keepAliveInterval);
    };

    const cleanup = setupKeepAlive();
    return () => cleanup();
  }, [lastActivity]);

  useEffect(() => {
    const handleActivity = () => {
      updateLastActivity();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keypress', handleActivity);
      window.addEventListener('scroll', handleActivity);
      window.addEventListener('click', handleActivity);
    };
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(scrollToBottom, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setInputValue(prev => prev + '\n\nFile content:\n' + content);
        }
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const userMessage: ChatMessage = {
        role: 'user',
        content: inputValue,
        timestamp: new Date().toLocaleTimeString()
      };
      
      const updatedMessages = [...messages, userMessage];
      if (onMessagesUpdate) {
        onMessagesUpdate(updatedMessages);
      }

      const response = await submitChatMessage(
        inputValue,
        initialContent,
        messages
      );

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };
      
      if (onMessagesUpdate) {
        onMessagesUpdate([...updatedMessages, aiMessage]);
      }

      if (onUpdateContent) {
        onUpdateContent(response);
      }

      setInputValue('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      const element = document.getElementById(messageId);
      if (element) {
        element.classList.add('copied');
        setTimeout(() => {
          element.classList.remove('copied');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };


  const renderContent = (content: string) => {
    const cleanContent = content.replace(/<div[^>]*>|<\/div>/g, '');
    return (
      <ReactMarkdown
        className="prose prose-sm dark:prose-invert max-w-none"
        components={{ code: MarkdownCodeBlock }}
      >
        {cleanContent}
      </ReactMarkdown>
    );
  };

  const groupMessages = (messages: ChatMessage[]): MessageGroup[] => {
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    messages.forEach((message) => {
      if (!currentGroup || currentGroup.messages[0].role !== message.role) {
        currentGroup = {
          id: `group-${groups.length}`,
          messages: [message],
          timestamp: message.timestamp
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
        currentGroup.timestamp = message.timestamp;
      }
    });

    return groups;
  };

const renderMessageGroups = (
  messages: ChatMessage[],
  copyMessage: (content: string, messageId: string) => void,
  renderContent: (content: string) => React.ReactNode
) => {
  const groups = groupMessages(messages);
  return groups.map((group) => {
    const isAssistant = group.messages[0].role === 'assistant';
    return (
      <div
        key={group.id}
        className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div
          className={`max-w-[85%] ${
            isAssistant
              ? 'bg-vscode-section border border-vscode-border'
              : 'bg-vscode-button'
          } rounded-sm overflow-hidden`}
        >
          {group.messages.map((message, index) => {
            const messageId = `${group.id}-message-${index}-${message.timestamp}`;
            return (
              <MessageButton
                key={messageId}
                message={message}
                messageId={messageId}
                isLast={index === group.messages.length - 1}
                onCopy={copyMessage}
                renderContent={renderContent}
              />
            );
          })}
        </div>
      </div>
    );
  });
};

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {}
      <section
        className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-hide"
        aria-label="Chat messages area"
      >
        {renderMessageGroups(messages, copyMessage, renderContent)}
        <div ref={messagesEndRef} />
      </section>

      {}
      <form 
        onSubmit={handleSubmit}
        className="border-t border-vscode-border bg-vscode-panel p-4"
      >
        {selectedFile && (
          <div className="mb-2 px-3 py-2 bg-vscode-section border border-vscode-border rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-vscode-fg">
              <Paperclip className="w-4 h-4" />
              <span className="truncate">{selectedFile.name}</span>
              <span className="text-vscode-fg/50">
                ({formatFileSize(selectedFile.size)})
              </span>
            </div>
            <button
              type="button"
              onClick={removeSelectedFile}
              className="p-2 hover:bg-vscode-list-hover rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="w-full px-3 py-2 text-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border rounded-sm resize-none
                placeholder-vscode-input-fg/50 focus:outline-none focus:border-vscode-active focus:ring-1 focus:ring-vscode-active"
              style={{ minHeight: '40px', maxHeight: '200px' }}
              rows={1}
              disabled={isSubmitting}
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
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-vscode-fg/50 hover:text-vscode-fg hover:bg-vscode-list-hover rounded-sm"
              disabled={isSubmitting}
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isSubmitting}
            className="px-3 py-2 bg-vscode-button text-vscode-button-fg rounded-sm hover:bg-vscode-button-hover disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="mt-2 text-xs text-vscode-fg flex justify-between">
          <span>Press <kbd>Enter</kbd> to send</span>
          <span>Press <kbd>Shift</kbd> + <kbd>Enter</kbd> for new line</span>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 