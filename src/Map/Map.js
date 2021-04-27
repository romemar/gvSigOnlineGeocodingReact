import React, { useRef, useState, useEffect } from "react"
import "./Map.css";
import MapContext from "./MapContext";
import * as ol from "ol";

/*
import * as geom from './geom';

const addMarker = (coord)=> {
      let marcador = new ol.Feature({
        geometry: new ol.geom.Point(
            ol.proj.fromLonLat(coord)// En dónde se va a ubicar
        ),
    });

    // Agregamos icono
    marcador.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: "pizza.png",
        })
    }));

    // marcadores debe ser un arreglo
    const marcadores = []; // Arreglo para que se puedan agregar otros más tarde

    marcadores.push(marcador);// Agregamos el marcador al arreglo

    let capa = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: marcadores, // A la capa le ponemos los marcadores
        }),
    });
    // Y agregamos la capa al mapa
    mapa.addLayer(capa);

}
*/

const Map = ({ children, zoom, center }) => {
    const mapRef = useRef();
    const [map, setMap] = useState(null);

    // on component mount
    useEffect(() => {
      let options = {
        view: new ol.View({ zoom, center }),
        layers: [],
        controls: [],
        overlays: []
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
      map.getView().setCenter(center)
    }, [center])
    return (
      <MapContext.Provider value={{ map }}>
        <div ref={mapRef} className="ol-map">
          {children}
        </div>
      </MapContext.Provider>
    )
  }
  export default Map;