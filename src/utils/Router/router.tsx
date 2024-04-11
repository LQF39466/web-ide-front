import { createBrowserRouter } from "react-router-dom";
import MainMenuLayout from "../../pages/MainMenu";
import EditorLayout from "../../pages/Editor";

const Router = createBrowserRouter([
    {
        path: "/",
        element: <MainMenuLayout />,
    },
    {
        path: "/code/:uid",
        element: <EditorLayout />,
    }
])

export default Router