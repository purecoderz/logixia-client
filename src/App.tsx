import { AppLoading } from "./components/ui/AppLoading";
import { useAuth } from "./features/auth/context/AuthContext";
import {
  NavigationMotionContext,
  useNavigationTransition,
} from "./layouts/navigation/NavigationMotion";
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
        <AppLoading message="Returning to Logixia…" />
      )}
    </NavigationMotionContext>
  );
}

export default App;
