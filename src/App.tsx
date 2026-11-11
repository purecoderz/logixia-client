import { AppLoading } from "./components/ui/AppLoading";
import { useAuth } from "./features/auth/context/AuthContext";
import {
  NavigationMotionContext,
  useNavigationTransition,
} from "./layouts/navigation/NavigationMotion";
import { PublicHeader } from "./layouts/PublicLayout/PublicHeader";
import { ApplicationRoutes } from "./routes/ApplicationRoutes";

function App() {
  const { profile, isLoading } = useAuth();
  const { displayedLocation, motion } = useNavigationTransition(!!profile);

  if (isLoading && displayedLocation.pathname === "/")
    return <AppLoading message="Checking your session…" />;

  return (
    <NavigationMotionContext value={motion}>
      <ApplicationRoutes
        location={displayedLocation}
        signedIn={Boolean(profile)}
      />
      {motion === "public-return" && (
        <div
          inert
          aria-hidden="true"
          className="playground-returning-header fixed inset-x-0 top-0 z-[110] bg-canvas text-body"
        >
          <PublicHeader />
        </div>
      )}
    </NavigationMotionContext>
  );
}

export default App;
