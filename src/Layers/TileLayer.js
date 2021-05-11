import React, { useContext, useEffect, useState } from "react";
import MapContext from "../Map/MapContext";
import OLTileLayer from "ol/layer/Tile";
import { fromLonLat, toLonLat } from "ol/proj";
import Overlay from "ol/Overlay.js";
//import Popup from 'ol/overlay'

const TileLayer = ({ source, zIndex = 0, geoOn, url }) => {

  const { map } = useContext(MapContext);

  const allowRevGeo = geoOn;
  const gvSigUrl = url;
  const [popupPosition, setPopupPosition] = useState([0, 0]);
  const [popupText, setPopupText] = useState("here");
  const popupElement = React.createElement(
    "div",
    { className: "ol-popup" },
    popupText
  );

  const reverseGeocode = (evt, url) => {
    var coord = toLonLat(evt.coordinate);
    console.log(coord);
    var type = "new_cartociudad";

    let formBody = [];

    var encodedKeyCoord = encodeURIComponent(coord);
    formBody.push("coord=" + encodedKeyCoord);

    var encodedKeyType = encodeURIComponent(type);
    formBody.push("type=" + encodedKeyType);

    formBody = formBody.join("&");
    //coord=-2.774274873462422%2C41.56326798105209&type=new_cartociudad
    console.log("FORM_BODY==> " + formBody);

    return fetch(url + "/geocoding/get_location_address/", {
      method: "POST",
      headers: {
        //"Content-Type": "application/json"
        "Content-Type": "application/x-www-form-urlencoded",
        // "X-CSRFToken": csrftoken
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: formBody, // body data type must match "Content-Type" header
    })
      .then((response) => response.json())
      .then((json) => {
        console.log("get_location_address: " + JSON.stringify(json));

        //setCenter(fromLonLat([json.lng,json.lat]))
        //setZoom(14)
        let coordLocation = fromLonLat([json.lng, json.lat]);
        setPopupPosition(coordLocation);

        console.log(coordLocation);
        var mensaje =
          "Dirección: " +
          JSON.stringify(json.tip_via) +
          JSON.stringify(json.address) +
          ", " +
          JSON.stringify(json.portalNumber) +
          "\n" +
          JSON.stringify(json.muni) +
          ", " +
          JSON.stringify(json.province) +
          "\n" +
          JSON.stringify(json.postalCode) +
          ", " +
          JSON.stringify(json.comunidadAutonoma) +
          ", Coordenadas: " +
          coordLocation;
        alert(mensaje);
        setPopupText(mensaje);

        /*
        //map.overlays.setPosition(evt.coordinate)
          //setPopupCoord(evt.coordinate);
          //alert(toLonLat(evt.coordinate))
          //console.log(toLonLat(evt.coordinate))
  
          get_location_address: {"id":"450540332179","province":"Toledo","comunidadAutonoma":"Castilla-La Mancha","muni":"Corral de Almaguer",
          "type":null,"address":"AP-36","postalCode":"45880","poblacion":null,"geom":"POINT (-3.1208884461448116 39.68808214367244)","tip_via":null,
          "lat":39.68808214367244,"lng":-3.1208884461448116,"portalNumber":45,"stateMsg":"Resultado exacto de la bÃºsqueda","state":1,"priority":0,
          "countryCode":"011","refCatastral":null,"source":"new_cartociudad","srs":"EPSG:4258"}
      */
      })
      .catch((err) => console.error(err.message));
  };

  
  useEffect(() => {
    if (!map) return;

    let tileLayer = new OLTileLayer({
      source,
      zIndex,
      allowRevGeo,
    });

    map.addLayer(tileLayer);
    tileLayer.setZIndex(zIndex);
    /*
    const overlay = new Overlay({
      position: popupPosition,
      element: popupElement,
      positioning: 'center-center',
      stopEvent: false
    });
    map.addOverlay(overlay);
*/

    return () => {
      if (map) {
        map.removeLayer(tileLayer);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    console.log("Activado? " + allowRevGeo);

    if (allowRevGeo) {
      map.on("singleclick", (evt) => {
        reverseGeocode(evt, gvSigUrl);
      });
    } else {
      map.un("singleclick", (evt) => {
        reverseGeocode(evt, gvSigUrl);
      });
    }

    /*
    if(!allowRevGeo) { 
    map.un("singleclick", (evt) => {
        reverseGeocode(evt, gvSigUrl);
      })
  }

  if(!allowRevGeo) { 
      map.removeEventListener('singleclick');
    }
  
  */
    /*
    const overlay = new Overlay({
      position: popupPosition,
      element: popupElement,
      positioning: 'center-center',
      stopEvent: false
    });
    map.addOverlay(overlay);
*/

return () => {
  if (map) {
    map.un("singleclick", (evt) => {
      reverseGeocode(evt, gvSigUrl);
    });
  }
};
  }, [allowRevGeo]);
  return null;
};
export default TileLayer;
