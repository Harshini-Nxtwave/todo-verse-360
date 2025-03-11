
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, MousePointer, RotateCcw } from "lucide-react";
import { useState } from "react";

const VRControls: React.FC = () => {
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-10">
      <Button
        variant="outline"
        className="bg-vr-bg text-vr-text border-vr-primary hover:bg-vr-primary/20 hover:text-vr-text"
        onClick={() => setShowControls(!showControls)}
      >
        <Info className="w-4 h-4 mr-2" />
        {showControls ? "Hide Controls" : "Show Controls"}
      </Button>

      {showControls && (
        <Card className="mt-2 bg-vr-bg/80 backdrop-blur-md text-vr-text border-vr-primary w-64">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-vr-primary mb-2">VR Todo Controls</h3>
            <Separator className="bg-vr-primary/30 my-2" />
            
            <div className="space-y-2">
              <div className="flex items-center">
                <MousePointer className="w-4 h-4 mr-2 text-vr-accent" />
                <span className="text-sm">Click on a todo to interact with it</span>
              </div>
              
              <div className="flex items-center">
                <RotateCcw className="w-4 h-4 mr-2 text-vr-accent" />
                <span className="text-sm">Drag to rotate the view</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2 text-vr-accent flex items-center justify-center">⚙️</span>
                <span className="text-sm">Scroll to zoom in/out</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VRControls;
