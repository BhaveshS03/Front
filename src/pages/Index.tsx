import { Header } from "@/components/Header";
import { Toolbar } from "@/components/Toolbar";
import { DocumentSidebar } from "@/components/DocumentSidebar";
import { Editor } from "@/components/Editor";

const Index = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <DocumentSidebar />
        
        <div className="flex-1 flex flex-col">
          <Toolbar />
          <Editor />
        </div>
      </div>
    </div>
  );
};

export default Index;
