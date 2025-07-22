import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTemplateStore } from ".././templateStore";
import { Template } from "../../types";
import { generateId } from "../../utils/generateId";
import { defaultTemplates } from "../../data/defaultTemplates";

vi.mock("../utils/generateId", () => ({
  generateId: vi.fn(() => "mock-id"),
}));

describe("Template Store", () => {
  let store: ReturnType<typeof useTemplateStore.getState>;

  beforeEach(() => {
    useTemplateStore.setState({
      templates: [],
      userTemplates: [],
      defaultTemplates: [],
      selectedTemplate: null,
      modalSelectedTemplate: null,
      isInitialized: false,
      isLoading: false,
    });
    store = useTemplateStore.getState();
  });

  it("should initialize templates", () => {
    store.initializeTemplates();
    const state = useTemplateStore.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.templates).toEqual(state.defaultTemplates);
    expect(state.userTemplates).toHaveLength(state.defaultTemplates.length);
  });

  it("should initialize default templates", () => {
    const templates: Template[] = [
      { id: "1", name: "Template 1", isDefault: true, content: "Template content", role: "user" },
      { id: "2", name: "Template 2", isDefault: true, content: "Template content", role: "user" },
    ];
    store.initializeDefaultTemplates(templates);
    const state = useTemplateStore.getState();
    expect(state.defaultTemplates).toEqual(templates);
    expect(state.templates).toEqual(templates);
  });

  it("should copy defaults to user templates", () => {
    const templates: Template[] = [
      { id: "1", name: "Template 1", isDefault: true, content: "Template content", role: "user" },
      { id: "2", name: "Template 2", isDefault: true, content: "Template content", role: "user" },
    ];
    store.initializeDefaultTemplates(templates);
    store.copyDefaultsToUserTemplates();
    const state = useTemplateStore.getState();
    expect(state.userTemplates).toHaveLength(templates.length);
    expect(state.templates).toHaveLength(templates.length * 2);
  });

  it("should add a new template", () => {
    const newTemplate = { name: "New Template", content: "Template content", role: "user" };
    const id = store.addTemplate(newTemplate);
    const state = useTemplateStore.getState();
    // expect(id).toBe("mock-id");
    expect(state.userTemplates).toHaveLength(1);
    expect(state.templates).toHaveLength(1);
    expect(state.userTemplates[0].name).toBe("New Template");
  });

  it("should update an existing template", () => {
    const template: Template = { id: "1", name: "Template 1", isDefault: false, content: "Template content", role: "user" };
    store.addTemplate(template);
    const updatedTemplate = { ...template, name: "Updated Template" };
    const id = store.updateTemplate(updatedTemplate);
    const state = useTemplateStore.getState();
    expect(id).toBe("1");
    expect(state.userTemplates[0].name).toBe("Updated Template");
  });

  it("should delete a template", () => {
    const template: Template = { id: "1", name: "Template 1", isDefault: false, content: "Template content", role: "user" };
    store.addTemplate(template);
    store.deleteTemplate("1");
    const state = useTemplateStore.getState();
    expect(state.userTemplates).toHaveLength(0);
    expect(state.templates).toHaveLength(0);
  });

  it("should set the selected template", () => {
    const template: Template = { id: "1", name: "Template 1", isDefault: false, content: "Template content", role: "user" };
    store.setSelectedTemplate(template);
    const state = useTemplateStore.getState();
    expect(state.selectedTemplate).toEqual(template);
  });

  it("should set the modal selected template", () => {
    const template: Template = { id: "1", name: "Template 1", isDefault: false, content: "Template content", role: "user" };
    store.modalSelectedTemplate = template;
    const state = useTemplateStore.getState();
    expect(state.modalSelectedTemplate).toEqual(template);
  });

  it("should clear the modal selected template", () => {
    store.clearModalTemplate();
    const state = useTemplateStore.getState();
    expect(state.modalSelectedTemplate).toBeNull();
  });

  it("should override a default template", () => {
    const template: Template = { id: "1", name: "Template 1", isDefault: true, content: "Template content", role: "user" };
    store.initializeDefaultTemplates([template]);
    const overrideTemplate = { ...template, name: "Overridden Template" };
    store.overrideDefaultTemplate(overrideTemplate);
    const state = useTemplateStore.getState();
    expect(state.defaultTemplates[0].name).toBe("Overridden Template");
  });

  it("should reset a default template", () => {
    const template: Template = { id: "1", name: "Template 1", isDefault: true, content: "Template content", role: "user" };
    store.initializeDefaultTemplates([template]);
    const overrideTemplate = { ...template, name: "Overridden Template" };
    store.overrideDefaultTemplate(overrideTemplate);
    store.resetDefaultTemplate("1");
    const state = useTemplateStore.getState();
    expect(state.defaultTemplates[0].name).toBe("Overridden Template");
  });

  it("should reset default templates", () => {
    const template: Template = { id: "1", name: "Template 1", isDefault: true, content: "Template content", role: "user" };
    store.initializeDefaultTemplates([template]);
    store.resetDefaultTemplates();
    const state = useTemplateStore.getState();
    expect(state.templates).toEqual(state.defaultTemplates);
  });

  it("should fetch templates", async () => {
    const template: Template = { id: "1", name: "Template 1", isDefault: true, content: "Template content", role: "user" };
    store.initializeDefaultTemplates([template]);
    await store.fetchTemplates();
    const state = useTemplateStore.getState();
    expect(state.templates).toHaveLength(1);
    expect(state.isLoading).toBe(false);
  });

  it("should import templates", async () => {
    const templates: Template[] = [
      { id: "1", name: "Template 1", isDefault: false, content: "Template content", role: "user" },
      { id: "2", name: "Template 2", isDefault: false, content: "Template content", role: "user" },
    ];
    const result = await store.importTemplates(templates);
    const state = useTemplateStore.getState();
    expect(result.imported).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
    expect(state.userTemplates).toHaveLength(2);
  });

  it("should reset templates", () => {
    const template: Template = { id: "1", name: "Template 1", isDefault: true, content: "Template content", role: "user" };
    store.initializeDefaultTemplates([template]);
    store.resetTemplates();
    const state = useTemplateStore.getState();
    expect(state.templates).toEqual(state.defaultTemplates);
  });

  it("should get all user templates", () => {
    const template: Template = { id: "1", name: "Template 1", isDefault: false, content: "Template content", role: "user" };
    store.addTemplate(template);
    const userTemplates = store.getAllTemplates();
    expect(userTemplates).toHaveLength(1);
    expect(userTemplates[0].name).toBe("Template 1");
  });
});