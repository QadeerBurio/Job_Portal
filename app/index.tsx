import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) return null;

  return isLoggedIn ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}
