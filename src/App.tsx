import React, { useEffect, Suspense, lazy, useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useStore } from "./store/useStore";
import { useTemplateStore } from "./store/templateStore";
import { useRoleStore } from "./store/roleStore";

import { defaultRoles } from "./data/defaultRoles";
import LoginPage from "./components/LoginPage";
import { Sidebar } from "./components/Sidebar";
import TemplateList from "./components/TemplateList";
import authService from "./services/authService";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ModalMode } from "./types";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EnhancePromptModal from "./components/EnhancePromptModal";

const CreateTemplateModal = lazy(
  () => import("./components/CreateTemplateModal")
);
const CreatePromptModal = lazy(() => import("./components/CreatePromptModal"));
const ManageModal = lazy(() => import("./components/ManageModal"));
const PreviewPage = lazy(() => import("./components/PreviewPage"));

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const {
    isAuthenticated,
    modalMode,
    isCreateModalOpen,
    isManageModalOpen,
  } = useStore();
  const {
    fetchTemplates,
    isLoading: isLoadingTemplates,
    initializeTemplates,
  } = useTemplateStore();
  const { initializeDefaultRoles } = useRoleStore();
  const [showEnhancePrompt, setShowEnhancePrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);

  const currentUser = authService.getUser();

  useEffect(() => {
    const initializeApp = async () => {
      if (isAuthenticated) {
        try {
          setIsInitializing(true);

          const roleState = useRoleStore.getState();
          const templateState = useTemplateStore.getState();

          if (!roleState.isInitialized) {
            initializeDefaultRoles(defaultRoles);
          }

          if (!templateState.isInitialized) {
            initializeTemplates();
          }

          await fetchTemplates();
        } catch (error) {
          console.error("Failed to initialize application:", error);
        } finally {
          setIsInitializing(false);
        }
      }
    };
    initializeApp();
  }, [
    isAuthenticated,
    fetchTemplates,
    initializeDefaultRoles,
    initializeTemplates,
  ]);

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <ErrorBoundary>
          <LoginPage />
        </ErrorBoundary>
      </ThemeProvider>
    );
  }

  if (isLoadingTemplates || isInitializing) {
    return (
      <ThemeProvider>
        <ErrorBoundary>
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </ErrorBoundary>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="flex min-h-screen bg-gray-100 dark:bg-dark-bg">
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              success: {
                style: {
                  background: "#2563eb",
                  color: "#fff",
                },
              },
              error: {
                style: {
                  background: "#dc2626",
                  color: "#fff",
                },
              },
              loading: {
                style: {
                  background: "#363636",
                  color: "#fff",
                },
              },
            }}
          />
          <Sidebar setShowEnhancePrompt={setShowEnhancePrompt} />
          <main className="flex-1 ml-16 transition-all duration-300 ease-in-out overflow-y-auto scrollbar-hide">
            <div className="pt-2">
              <div className="min-h-[calc(100vh-3rem)]">
                <TemplateList userId={currentUser?.username} />
              </div>
            </div>
          </main>
          {/* Modals */}
          <Suspense fallback={<LoadingFallback />}>
            {isCreateModalOpen &&
              modalMode === ("createPrompt" as ModalMode) && (
                <CreatePromptModal />
              )}
            {isCreateModalOpen &&
              modalMode === ("createPromptWithTemplate" as ModalMode) && (
                <CreatePromptModal />
              )}
            {isCreateModalOpen &&
              modalMode === ("updatePrompt" as ModalMode) && (
                <CreatePromptModal />
              )}
            {isCreateModalOpen &&
              modalMode === ("createTemplate" as ModalMode) && (
                <CreateTemplateModal />
              )}
            {isCreateModalOpen &&
              modalMode === ("updateTemplate" as ModalMode) && (
                <CreateTemplateModal />
              )}
            {isManageModalOpen && modalMode === ("manage" as ModalMode) && (
              <ManageModal />
            )}
            <EnhancePromptModal
              isOpen={showEnhancePrompt}
              onClose={() => setShowEnhancePrompt(false)}
              onSubmit={(enhancedPrompt) => {
                setCurrentPrompt(enhancedPrompt);
                setShowEnhancePrompt(false);
              }}
              currentPrompt={currentPrompt}
            />
          </Suspense>
          <ToastContainer />
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default React.memo(App);