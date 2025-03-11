import { useEffect, useState, Suspense, lazy } from "react";
import VRControls from "@/components/ui/VRControls";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { useTodoStore } from "@/store/todoStore";

// Use React's lazy loading instead of Next.js dynamic
const VRScene = lazy(() => import("@/components/vr/VRScene"));

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const todoStore = useTodoStore();

  useEffect(() => {
    // Show toast when successfully loaded
    const loadHandler = setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "VR Todos Loaded",
        description: "Welcome to your 3D Todo experience!",
        duration: 3000,
      });
    }, 1500);

    return () => clearTimeout(loadHandler);
  }, [toast]);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-vr-bg">
      {isLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <LoadingSpinner size={60} className="mb-4" />
          <h2 className="text-vr-text text-2xl font-bold">Loading VR Todo Space</h2>
          <p className="text-vr-text/70 mt-2">Preparing your immersive experience...</p>
        </div>
      ) : (
        <Suspense fallback={
          <div className="w-full h-full flex flex-col items-center justify-center">
            <LoadingSpinner size={60} className="mb-4" />
            <h2 className="text-vr-text text-2xl font-bold">Initializing VR</h2>
          </div>
        }>
          <VRControls />
          <VRScene />
          
          <div className="absolute bottom-4 left-4 z-10 text-xs text-vr-text/50">
            Navigate with mouse: Click to interact, drag to rotate, scroll to zoom
          </div>
        </Suspense>
      )}
    </div>
  );
};

export default Index;
