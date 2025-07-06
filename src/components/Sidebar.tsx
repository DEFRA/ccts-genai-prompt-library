import {
  ChevronRight,
  LogOut,
  Moon,
  PlusCircle,
  Settings,
  Sun,
  UserCircle,
  Wand2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useStore } from "../store/useStore";
import { ModalMode } from "../types";

interface SidebarProps {
  setShowEnhancePrompt: (show: boolean) => void;
}

const Tooltip: React.FC<{ content: string; visible: boolean }> = ({ content, visible }) => {
  if (!visible) return null;
  return (
    <div className="absolute left-full ml-2 px-2 py-1 bg-vscode-dropdown text-vscode-dropdown-fg text-xs rounded shadow-lg whitespace-nowrap z-50 animate-fade-in">
      {content}
      <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 border-4 border-transparent border-r-vscode-dropdown" />
    </div>
  );
};

interface NavItem {
  id: string;
  name: string;
  icon: React.ElementType;
  onClick: () => void;
  className: string;
}



interface ThemeClasses {
  sidebar: string;
  border: string;
  hover: string;
  background: string;
  text: string;
}

const getThemeClasses = (theme: string): ThemeClasses => ({
  sidebar: theme === "dark" ? "bg-vscode-sidebar text-vscode-sidebar-fg" : "bg-light-sidebar text-light-sidebar-fg",
  border: theme === "dark" ? "border-vscode-border" : "border-light-border",
  hover: theme === "dark" ? "vscode-list-hover" : "light-list-hover",
  background: theme === "dark" ? "bg-vscode-sidebar" : "bg-light-sidebar",
  text: "text-gray-700 dark:text-gray-300",
});

const useSidebarState = () => {
  const {isSidebarExpanded } = useStore();
  const [isExpanded, setIsExpanded] = useState(isSidebarExpanded);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  useEffect(() => {
    setIsExpanded(isSidebarExpanded);
  }, [isSidebarExpanded]);

  return {
    isExpanded,
    setIsExpanded,
    activeItem,
    setActiveItem,
    hoveredItem,
    setHoveredItem,
  };
};

export const Sidebar: React.FC<SidebarProps> = ({ setShowEnhancePrompt }) => {
  const { theme, toggleTheme, logoToDisplay } = useTheme();
  const { toggleCreateModal, toggleManageModal, isCreateModalOpen, isManageModalOpen, setModalMode, currentUser, isAdmin, logout, toggleLogoClick, toggleSidebar } = useStore();

  const {
    isExpanded,
    setIsExpanded,
    activeItem,
    setActiveItem,
    hoveredItem,
    setHoveredItem,
  } = useSidebarState();

  const handleToggleSidebar = () => {
    setIsExpanded(!isExpanded);
    toggleSidebar();
  };

  const handleCreatePrompt = () => {
    setModalMode("createPrompt" as ModalMode);
    toggleCreateModal();
  };
  
  const handleManage = () => {
    setModalMode("manage" as ModalMode);
    toggleManageModal();
  };
  
  const handleLogout = () => {
    toggleLogoClick(false);
    logout();
  };

  const getMainNavItems = (): NavItem[] => [
    {
      id: "create-prompt",
      name: "Create Template",
      icon: PlusCircle,
      onClick: handleCreatePrompt,
      className: "text-gray-700 dark:text-gray-300",
    },
    {
      id: "enhance-prompt",
      name: "Enhance Prompt",
      icon: Wand2,
      onClick: () => setShowEnhancePrompt(true),
      className: "text-gray-700 dark:text-gray-300",
    },
    {
      id: "manage",
      name: "Manage",
      icon: Settings,
      onClick: handleManage,
      className: "text-gray-700 dark:text-gray-300",
    },
  ];

  const getBottomNavItems = (): NavItem[] => [
    {
      id: "theme-toggle",
      name: `Toggle Theme`,
      icon: theme === "dark" ? Sun : Moon,
      onClick: toggleTheme,
      className: getThemeClasses(theme).text,
    },
  ];

  useEffect(() => {
    if (!isCreateModalOpen && !isManageModalOpen) {
      setActiveItem(null);
    }
  }, [isCreateModalOpen, isManageModalOpen]);
  return (
    <aside 
      className={`fixed left-0 top-0 h-full ${getThemeClasses(theme).sidebar} ${
        isExpanded ? 'w-64' : 'w-16'
      } transition-width duration-200 ease-in-out flex flex-col items-start justify-between`}
      aria-label="Sidebar Navigation"
    >
      <button
        aria-label="Toggle sidebar"
        onClick={handleToggleSidebar}
        className={`absolute -right-2.5 top-11
          ${getThemeClasses(theme).background}
          p-0.5 rounded-full border
          ${getThemeClasses(theme).border}
          hover:border-${theme === "dark" ? "vscode" : "light"}-active`}
      >
        <ChevronRight
          className={`w-3.5 h-3.5
            ${getThemeClasses(theme).text}
            transition-transform
            ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`p-2.5 w-full border-b ${getThemeClasses(theme).border}`}>
        <div className={`flex items-center ${!isExpanded && "justify-center"}`}>
          <img
            src={logoToDisplay}
            alt="Prompt Laibrary"
            className={`transition-transform duration-200 hover:scale-105 ${isExpanded ? "h-6 w-6" : "h-5.5 w-5.5"}`}
          />
          {isExpanded && currentUser && (
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid="user-name">
                  {currentUser.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400" data-testid="user-email">
                  {currentUser.email}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex flex-col h-[calc(100%-4rem)] justify-between py-2">
        <div className="space-y-0.5 px-1">
          {getMainNavItems().map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              onMouseEnter={() => !isExpanded && setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              aria-label={item.name}
              className={`w-full flex items-center gap-2 p-1.5 text-vscode-sidebar-fg hover:bg-vscode-list-hover rounded-lg group relative ${
                !isExpanded && 'justify-center'
              } ${activeItem === item.id ? 'bg-vscode-list-active' : ''}`}
            >
              <item.icon className={`w-6 h-6 ${!isExpanded ? 'group-hover:scale-110 transition-transform duration-200' : ''}`} />
              {isExpanded && <span>{item.name}</span>}
              {!isExpanded && hoveredItem === item.id && (
                <Tooltip content={item.name} visible />
              )}
            </button>
          ))}
          {isAdmin && (
            <div className={`mt-4 ${!isExpanded ? 'text-center' : ''}`}>
              <span className="text-gray-500">Admin</span>
            </div>
          )}
        </div>
        <div className="space-y-2 px-2">
          {getBottomNavItems().map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              onMouseEnter={() => !isExpanded && setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              aria-label={item.name}
              className={`w-full flex items-center gap-2 p-1.5 text-vscode-sidebar-fg hover:bg-vscode-list-hover rounded-lg group relative ${
                !isExpanded && 'justify-center'
              } ${activeItem === item.id ? 'bg-vscode-list-active' : ''}`}
            >
              <item.icon className={`w-6 h-6 ${!isExpanded ? 'group-hover:scale-110 transition-transform duration-200' : ''}`} />
              {isExpanded && <span>{item.name}</span>}
              {!isExpanded && hoveredItem === item.id && (
                <Tooltip content={item.name} visible />
              )}
            </button>
          ))}
          
          <div className="pt-2 mt-2 border-t border-vscode-border">
            <div className="px-0 relative">
              <button
                aria-label={isExpanded ? `Logout ${currentUser?.username}` : "Logout"}
                onClick={handleLogout}
                className="w-full justify-center flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                tabIndex={0}
              >
                <UserCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                {isExpanded && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{currentUser?.username}</span>
                    <span className="text-xs text-gray-500">{currentUser?.email}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-gray-50/90 dark:bg-gray-800/90 rounded-lg transition-all duration-300 ease-in-out">
                  <LogOut className="w-6 h-6 text-red-500 transform scale-75 group-hover:scale-100 transition-transform duration-300 ease-in-out" />
                </div>
              </button>
            </div>
          </div>        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
