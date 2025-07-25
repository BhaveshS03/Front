// types/ot.ts
export type OTInsert = { 
    type: 'insert'; 
    pos: number; 
    char: string; 
  };
  
  export type OTDelete = { 
    type: 'delete'; 
    pos: number; 
  };
  
  export type OTOp = OTInsert | OTDelete;
  
  // Content structure for the editor
  export type Content = {
    [key: number]: string[];
  };
  
  export type Cursor = {
    line: number;
    ch: number;
  };