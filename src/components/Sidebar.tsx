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
import { useSync } from "../hooks/useSync";
import { useRoleStore } from "../store/roleStore";
import { useTemplateStore } from "../store/templateStore";
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

const SidebarNavButton: React.FC<{
  item: NavItem;
  isExpanded: boolean;
  activeItem: string | null;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  theme: string;
  isSyncing?: boolean;
}> = ({ item, isExpanded, activeItem, hoveredItem, setHoveredItem, theme, isSyncing }) => {
  let activeBgClass = "";
  if (activeItem === item.id) {
    activeBgClass = `bg-${theme === "dark" ? "vscode" : "light"}-list-active`;
  }

  return (
    <button
      key={item.id}
      onClick={item.onClick}
      onMouseEnter={() => !isExpanded && setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      className={`w-full flex items-center gap-2 p-1.5 ${
        theme === "dark"
          ? "text-vscode-sidebar-fg"
          : "text-light-sidebar-fg"
      } hover:bg-${
        theme === "dark" ? "vscode" : "light"
      }-list-hover rounded-lg group relative ${
        isExpanded ? "justify-start" : "justify-center"
      } ${activeBgClass}`}
      disabled={item.id === "sync-data" && isSyncing}
    >
      <item.icon
        className={`${
          isExpanded ? "w-5 h-5" : "w-6 h-6"
        } group-hover:scale-110 transition-transform duration-200`}
      />
      {isExpanded && (
        <span className="text-sm font-medium">{item.name}</span>
      )}
      <Tooltip
        content={item.name}
        visible={!isExpanded && hoveredItem === item.id}
      />
    </button>
  );
};

const UserInfo: React.FC<{
  currentUser: any;
  isAdmin: boolean;
  isExpanded: boolean;
  onLogout: () => void;
}> = ({ currentUser, isAdmin, isExpanded, onLogout }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="px-0 relative">
      <button
        onClick={onLogout}
        onMouseEnter={() => !isExpanded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-full justify-center flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
        aria-label="Logout"
        tabIndex={0}
      >
        <UserCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
        {isExpanded ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {currentUser.username ?? currentUser.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAdmin ? "Administrator" : "Standard User"}
              </p>
            </div>
            <LogOut className="w-6 h-6 text-red-500 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 ease-in-out" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-gray-50/90 dark:bg-gray-800/90 rounded-lg transition-all duration-300 ease-in-out">
            <LogOut className="w-6 h-6 text-red-500 transform scale-75 group-hover:scale-100 transition-transform duration-300 ease-in-out" />
          </div>
        )}
        <Tooltip
          content={`Logout (${currentUser.username})`}
          visible={showTooltip}
        />
      </button>
    </div>
  );
};

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  return {
    isExpanded,
    setIsExpanded,
    activeItem,
    setActiveItem,
    hoveredItem,
    setHoveredItem,
  };
};

export const Sidebar: React.FC<SidebarProps> = ({ setShowEnhancePrompt }): JSX.Element => {
  const {
    toggleCreateModal,
    toggleManageModal,
    setModalMode,
    logout,
    currentUser,
    isAuthenticated,
    isAdmin,
    toggleLogoClick,
    isCreateModalOpen,
    isManageModalOpen,
  } = useStore();
  const { resetDefaultRoles } = useRoleStore();
  const { resetDefaultTemplates } = useTemplateStore();
  const { theme, toggleTheme, logoToDisplay } = useTheme();
  const { isSyncing } = useSync(
    resetDefaultRoles,
    resetDefaultTemplates,
    currentUser,
    isAuthenticated,
    isAdmin
  );
  const {
    isExpanded,
    setIsExpanded,
    activeItem,
    setActiveItem,
    hoveredItem,
    setHoveredItem,
  } = useSidebarState();

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
      name: "Create Prompt",
      icon: PlusCircle,
      onClick: handleCreatePrompt,
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
      name: `${theme === "dark" ? "Light" : "Dark"} Mode`,
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
    <div className={`fixed left-0 top-0 h-full ${getThemeClasses(theme).sidebar}
      border-r ${getThemeClasses(theme).border}
      transition-width duration-500 ease-in-out z-50
      ${isExpanded ? "w-50" : "w-14"}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
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

      
      <div
        className={`p-2.5 w-full border-b ${
          theme === "dark" ? "border-vscode-border" : "border-light-border"
        }`}
      >
        <div className={`flex items-center ${!isExpanded && "justify-center"}`}>
          <img
            src={logoToDisplay}
            alt="Prompt Laibrary"
            className={`transition-transform duration-200 hover:scale-105 ${
              isExpanded ? "h-6 w-6" : "h-5.5 w-5.5"
            }`}
          />
          {isExpanded && (
            <div className="ml-3 flex-1 min-w-0 animate-fade-in">
              <div className="flex items-baseline">
                <span className="text-vscode-sidebar-fg font-bold text-large whitespace-nowrap">
                  Prompt
                </span>
                <div className="ml-1 flex-shrink-0 whitespace-nowrap font-bold text-large text-vscode-sidebar-fg">
                  L{' '}
                  <span className="text-purple-500 font-extrabold text-sm">ai</span>{' '}
                  brary
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      
      <nav className="flex flex-col h-[calc(100%-4rem)] justify-between py-2">
        
        <div className="space-y-0.5 px-1">
          {getMainNavItems().map((item) => (
            <SidebarNavButton
              key={item.id}
              item={item}
              isExpanded={isExpanded}
              activeItem={activeItem}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              theme={theme}
              isSyncing={isSyncing}
            />
          ))}
          {isAdmin && (
            <button
              onClick={() => setShowEnhancePrompt(true)}
              onMouseEnter={() => !isExpanded && setHoveredItem("enhance")}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full flex items-center gap-2 p-1.5
                ${getThemeClasses(theme).text}
                hover:bg-${theme === "dark" ? "vscode" : "light"}-list-hover
                rounded-lg group relative
                ${isExpanded ? "justify-start" : "justify-center"}`}
            >
              <Wand2
                className={`${
                  isExpanded ? "w-5 h-5" : "w-6 h-6"
                } group-hover:scale-110`}
              />
              {isExpanded && (
                <span className="text-sm font-medium">Enhance Prompt</span>
              )}
              <Tooltip
                content="Enhance Prompt"
                visible={!isExpanded && hoveredItem === "enhance"}
              />
            </button>
          )}
        </div>

        
        <div className="space-y-2 px-2">
          {getBottomNavItems().map((item) => (
            <SidebarNavButton
              key={item.id}
              item={item}
              isExpanded={isExpanded}
              activeItem={activeItem}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              theme={theme}
            />
          ))}
          <div
            className={`pt-2 mt-2 border-t ${getThemeClasses(theme).border}`}
          >
            <UserInfo
              currentUser={currentUser}
              isAdmin={isAdmin}
              isExpanded={isExpanded}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
