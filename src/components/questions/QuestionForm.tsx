import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionStore } from '../../stores/questionStore';
import Button from '../common/Button';
import FileUpload from '../common/FileUpload';
import { HelpCircle, Send } from 'lucide-react';

// Subject options
const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Geography',
  'Literature',
  'Languages',
  'Economics',
  'Business',
  'Psychology',
  'Philosophy',
  'Art',
  'Music',
  'Other'
];

interface FileWithPreview {
  id: string;
  name: string;
  type: string;
  url?: string;
}

const QuestionForm: React.FC = () => {
  const navigate = useNavigate();
  const { createQuestion, loading, error } = useQuestionStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState('');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  
  const handleFileUpload = (uploadedFiles: File[]) => {
    const newFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substring(2),
      name: file.name,
      type: file.type,
      // In a real app, we'd upload to a server and get a URL back
      url: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };
  
  const handleFileRemove = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Simple validation
    if (!title.trim()) {
      setFormError('Please enter a question title');
      return;
    }
    if (!content.trim()) {
      setFormError('Please enter your question details');
      return;
    }
    if (!subject) {
      setFormError('Please select a subject');
      return;
    }
    
    try {
      const parsedTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const question = await createQuestion({
        title,
        content,
        subject,
        tags: parsedTags,
        fileAttachments: files
      });
      
      navigate(`/questions/${question.id}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to post question');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="form-label">
          Question Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          placeholder="e.g., How do I solve this quadratic equation?"
          maxLength={150}
        />
      </div>
      
      <div>
        <label htmlFor="content" className="form-label">
          Question Details
        </label>
        <div className="flex flex-col">
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-input min-h-32"
            placeholder="Provide as much detail as possible. For math expressions, use x^2 for superscript notation."
            rows={6}
          />
          <div className="mt-1 text-xs text-gray-500 flex items-center">
            <HelpCircle className="h-3 w-3 mr-1" />
            <span>
              Use $ symbols for inline math and $$ for display mode math (e.g., $x^2$ or $$E=mc^2$$)
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="subject" className="form-label">
            Subject
          </label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-input"
          >
            <option value="">Select a subject</option>
            {SUBJECTS.map(subj => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="tags" className="form-label">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="form-input"
            placeholder="e.g., algebra, equations, homework"
          />
        </div>
      </div>
      
      <div>
        <label className="form-label">Attachments</label>
        <FileUpload
          onFileUpload={handleFileUpload}
          files={files}
          onFileRemove={handleFileRemove}
        />
      </div>
      
      {(formError || error) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {formError || error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="mr-3"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={<Send className="h-4 w-4" />}
          isLoading={loading}
        >
          Post Question
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;