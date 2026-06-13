import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import AboutUs from "../sections/About/AboutUs";
import Chatbot from "../sections/Chatbot";
import AnimatedStory from "../sections/AnimatedStory";
import SpaceGame from "../sections/SpaceGame";
import NotFound from "../sections/NotFound";

export const router = createBrowserRouter([
  { path: '/',            element: <App /> },
  { path: '/terra-game',  element: <Navigate to="/" replace /> },
  { path: '/about',       element: <AboutUs /> },
  { path: '/chatbot',     element: <Chatbot /> },
  { path: '/story',       element: <AnimatedStory /> },
  { path: '/space-game',  element: <SpaceGame /> },
  { path: '*',            element: <NotFound /> },
]);
