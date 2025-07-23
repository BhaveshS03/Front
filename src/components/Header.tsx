import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Share2, Download, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-gradient-subtle px-6 flex items-center justify-between">
      {/* Left: Logo and document title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">D</span>
          </div>
          <span className="font-semibold text-foreground">DocsEditor</span>
        </div>
        
        <div className="h-6 w-px bg-border mx-2" />
        
        <input
          type="text"
          defaultValue="Untitled Document"
          className="text-lg font-medium bg-transparent border-none outline-none focus:bg-accent rounded px-2 py-1 min-w-0 flex-1 max-w-xs"
        />
      </div>

      {/* Right: Actions and user */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        
        <Button variant="ghost" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-2" />

        {/* Collaboration avatars */}
        <div className="flex -space-x-2">
          <Avatar className="w-8 h-8 border-2 border-background">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
          </Avatar>
          <Avatar className="w-8 h-8 border-2 border-background">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">AL</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}