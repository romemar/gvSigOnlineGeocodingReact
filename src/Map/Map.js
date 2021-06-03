import React, { useRef, useState, useEffect } from "react";
import "./Map.css";
import MapContext from "./MapContext";
import "ol/ol.css";
import * as ol from "ol";
import Overlay from "ol/Overlay";

const Map = ({ children, zoom, center }) => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [type, setType] = useState();

  const handleonclicktype = (value) => {
    alert(value);
  };

  // on component mount
  useEffect(() => {
    let overlay = new Overlay({
      element: document.getElementById("popup"),
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    setOverlay(overlay);

    let options = {
      view: new ol.View({ zoom, center }),
      layers: [],
      controls: [],
      overlays: [],
    };
    let mapObject = new ol.Map(options);
    mapObject.setTarget(mapRef.current);
    setMap(mapObject);
    return () => mapObject.setTarget(undefined);
  }, []);
  // zoom change handler
  useEffect(() => {
    if (!map) return;
    map.getView().setZoom(zoom);
  }, [zoom]);
  // center change handler
  useEffect(() => {
    if (!map) return;
    map.getView().setCenter(center);
  }, [center]);
  return (
    <MapContext.Provider value={{ map, overlay }}>
      <div ref={mapRef} className="ol-map">
        {children}
      </div>
      <div id="popup" className="ol-popup">
        <button
          id="close-button"
          className="ol-popup-closer"
          onClick={(e) => overlay.setPosition(null)}
        />
        <div id="popup-content" className="popup-content"></div>
      </div>
    </MapContext.Provider>
  );
};
export default Map;
