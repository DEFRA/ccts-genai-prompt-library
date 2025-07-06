import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileHandling } from "../useFileHandling";
import { toast } from "react-hot-toast";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

describe("useFileHandling", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with an empty array for uploadedFiles", () => {
    // Act
    const { result } = renderHook(() => useFileHandling());
    
    // Assert
    expect(result.current.uploadedFiles).toEqual([]);
  });

  it("should handle file upload successfully", () => {
    // Arrange
    const { result } = renderHook(() => useFileHandling());
    const sectionId = "section1";
    const fileName = "test.txt";
    const fileContent = "This is a test file";
    
    // Mock File object
    const file = new File([fileContent], fileName, { type: "text/plain" });
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: fileContent
    };
    
    // Replace global FileReader with our mock
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    // Act
    act(() => {
      result.current.handleFileUpload(sectionId, file);
    });
    
    // Trigger onload event
    act(() => {
      mockFileReader.onload({ target: { result: fileContent } });
    });
    
    // Assert
    expect(mockFileReader.readAsText).toHaveBeenCalledWith(file);
    expect(result.current.uploadedFiles).toEqual([
      { id: sectionId, name: fileName, content: fileContent }
    ]);
  });

  it("should handle multiple file uploads", () => {
    // Arrange
    const { result } = renderHook(() => useFileHandling());
    
    // First file
    const sectionId1 = "section1";
    const fileName1 = "test1.txt";
    const fileContent1 = "This is test file 1";
    const file1 = new File([fileContent1], fileName1, { type: "text/plain" });
    
    // Second file
    const sectionId2 = "section2";
    const fileName2 = "test2.txt";
    const fileContent2 = "This is test file 2";
    const file2 = new File([fileContent2], fileName2, { type: "text/plain" });
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: ""
    };
    
    // Replace global FileReader with our mock
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    // Act - Upload first file
    act(() => {
      result.current.handleFileUpload(sectionId1, file1);
    });
    
    // Trigger onload event for first file
    act(() => {
      mockFileReader.onload({ target: { result: fileContent1 } });
    });
    
    // Act - Upload second file
    act(() => {
      result.current.handleFileUpload(sectionId2, file2);
    });
    
    // Trigger onload event for second file
    act(() => {
      mockFileReader.onload({ target: { result: fileContent2 } });
    });
    
    // Assert
    expect(mockFileReader.readAsText).toHaveBeenCalledTimes(2);
    expect(result.current.uploadedFiles).toEqual([
      { id: sectionId1, name: fileName1, content: fileContent1 },
      { id: sectionId2, name: fileName2, content: fileContent2 }
    ]);
  });

  it("should handle file read error", () => {
    // Arrange
    const { result } = renderHook(() => useFileHandling());
    const sectionId = "section1";
    const fileName = "test.txt";
    const fileContent = "This is a test file";
    
    // Mock File object
    const file = new File([fileContent], fileName, { type: "text/plain" });
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: null
    };
    
    // Replace global FileReader with our mock
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    // Act
    act(() => {
      result.current.handleFileUpload(sectionId, file);
    });
    
    // Trigger onerror event
    act(() => {
      mockFileReader.onerror();
    });
    
    // Assert
    expect(mockFileReader.readAsText).toHaveBeenCalledWith(file);
    expect(toast.error).toHaveBeenCalledWith("Failed to read file");
    // The file should not be added to uploadedFiles
    expect(result.current.uploadedFiles).toEqual([]);
  });

  it("should handle file upload with null target result", () => {
    // Arrange
    const { result } = renderHook(() => useFileHandling());
    const sectionId = "section1";
    const fileName = "test.txt";
    const fileContent = "This is a test file";
    
    // Mock File object
    const file = new File([fileContent], fileName, { type: "text/plain" });
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: null
    };
    
    // Replace global FileReader with our mock
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    // Act
    act(() => {
      result.current.handleFileUpload(sectionId, file);
    });
    
    // Trigger onload event with null result
    act(() => {
      mockFileReader.onload({ target: { result: null } });
    });
    
    // Assert
    expect(mockFileReader.readAsText).toHaveBeenCalledWith(file);
    // Should handle null result gracefully
    expect(result.current.uploadedFiles).toEqual([
      { id: sectionId, name: fileName, content: null as any }
    ]);
  });

  it("should add uploaded file directly through addUploadedFile", () => {
    // This test accesses the internal function through a workaround
    // We're using the fact that handleFileUpload calls addUploadedFile

    // Arrange
    const { result } = renderHook(() => useFileHandling());
    const sectionId = "section1";
    const fileName = "test.txt";
    const fileContent = "This is a test file";
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: fileContent
    };
    
    // Replace global FileReader with our mock
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    // Act - Directly trigger what happens in the onload handler
    act(() => {
      result.current.handleFileUpload(sectionId, new File([], fileName));
      mockFileReader.onload({ target: { result: fileContent } });
    });
    
    // Assert
    expect(result.current.uploadedFiles).toEqual([
      { id: sectionId, name: fileName, content: fileContent }
    ]);
  });
});
