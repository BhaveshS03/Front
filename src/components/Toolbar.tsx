import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  Type,
  Palette
} from "lucide-react";
import { useState } from "react";

export function Toolbar() {
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const toggleFormat = (format: string) => {
    const newFormats = new Set(activeFormats);
    if (newFormats.has(format)) {
      newFormats.delete(format);
    } else {
      newFormats.add(format);
    }
    setActiveFormats(newFormats);
  };

  const isActive = (format: string) => activeFormats.has(format);

  return (
    <div className="editor-toolbar h-12 px-4 flex items-center gap-1">
      {/* History */}
      <Button variant="ghost" size="sm" className="btn-editor">
        <Undo className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" className="btn-editor">
        <Redo className="w-4 h-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Font formatting */}
      <Button 
        variant="ghost" 
        size="sm" 
        className={`btn-editor ${isActive('bold') ? 'active' : ''}`}
        onClick={() => toggleFormat('bold')}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`btn-editor ${isActive('italic') ? 'active' : ''}`}
        onClick={() => toggleFormat('italic')}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`btn-editor ${isActive('underline') ? 'active' : ''}`}
        onClick={() => toggleFormat('underline')}
      >
        <Underline className="w-4 h-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Text styles */}
      <select className="px-2 py-1 text-sm bg-background border border-border rounded focus:ring-2 focus:ring-ring">
        <option>Normal</option>
        <option>Heading 1</option>
        <option>Heading 2</option>
        <option>Heading 3</option>
      </select>

      <Button variant="ghost" size="sm" className="btn-editor">
        <Type className="w-4 h-4" />
      </Button>

      <Button variant="ghost" size="sm" className="btn-editor">
        <Palette className="w-4 h-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Alignment */}
      <Button variant="ghost" size="sm" className="btn-editor">
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" className="btn-editor">
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" className="btn-editor">
        <AlignRight className="w-4 h-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Lists */}
      <Button variant="ghost" size="sm" className="btn-editor">
        <List className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" className="btn-editor">
        <ListOrdered className="w-4 h-4" />
      </Button>
    </div>
  );
}