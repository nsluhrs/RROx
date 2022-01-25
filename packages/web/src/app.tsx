import * as React from "react";
import {EnterKey} from "./Pages/EnterKeyPage";
import {MapPage} from "./Pages/MapPage";
import {PlayerSelect} from "./Pages/PlayerSelect";
import {MapSettings} from "./Pages/MapSettings";
import {ControlsPage} from "./Pages/ControlsPage";
import {ControlPage} from "./Pages/ControlPage";
import {FancyControlPage} from "./Pages/FancyControlPage";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {useSettings} from "./helpers/settings";

export function App(){
    const [ settings ] = useSettings();
    document.body.setAttribute('data-theme', settings["site.darkMode"] ? 'dark' : 'light');

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<EnterKey />} />
                <Route path="/:serverKey" element={<MapPage />} />
                <Route path="/:serverKey/players" element={<PlayerSelect />} />
                <Route path="/:serverKey/settings" element={<MapSettings />} />
                <Route path="/:serverKey/controls" element={<ControlsPage />} />
                <Route path="/:serverKey/controls/:id" element={<ControlPage />} />
                <Route path="/:serverKey/controls/:id/fancy" element={<FancyControlPage />} />
            </Routes>
        </BrowserRouter>
    );
}