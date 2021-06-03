import React, { useContext, useEffect, useState } from "react";
import MapContext from "../Map/MapContext";
import OLTileLayer from "ol/layer/Tile";
import { fromLonLat, toLonLat } from "ol/proj";
import { unByKey } from "ol/Observable";

const TileLayer = ({
  source,
  zIndex = 0,
  geoOn,
  url,
  center,
  setCenter,
  zoom,
  setZoom,
  provee,
}) => {
  const { map, overlay } = useContext(MapContext);

  const proveedores = provee;
  const allowRevGeo = geoOn;
  const gvSigUrl = url;
  const [keyEvent, setKeyEvent] = useState();
  const [type, setType] = useState("");

  const selectProveedor = async (evt, url, overlay) => {
    let coord = evt.coordinate;

    /*
    let response = await fetch(url + "/geocoding/get_providers_activated/");
    let json = await response.json();
    console.log(json.types);

    let proveedores = json.types;
*/
    let list = "";

    for (let i = 0; i < proveedores.length; i++) {
      list =
        list + "<li key=" + i + " class='liProv'>" + proveedores[i] + "</li>";
    }
    var popupProv =
      "<h4><strong>Proveedor de búsqueda</strong></h4>" +
      "<ul>" +
      list +
      "</ul>";

    var content = document.getElementById("popup-content");
    content.innerHTML = popupProv;

    overlay.setPosition(coord);

    var lis = document.getElementsByClassName("liProv");

    Array.from(lis).forEach((li) => {
      var tipo = li.innerHTML;
      console.log(tipo);
      li.addEventListener("click", () => {
        overlay.setPosition("");
        reverseGeocode(coord, tipo, gvSigUrl, overlay);
      });
    });
  };

  //--------función geocodificador inverso--------------

  const reverseGeocode = (coord, tipo, url, overlay) => {
    var coordenadas = toLonLat(coord);
    console.log(tipo);
    console.log(coord);

    let formBody = [];

    var encodedKeyCoord = encodeURIComponent(coordenadas);
    formBody.push("coord=" + encodedKeyCoord);

    var encodedKeyType = encodeURIComponent(tipo);
    formBody.push("type=" + encodedKeyType);

    formBody = formBody.join("&");

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

        setCenter([json.lng, json.lat]);
        setZoom(15);

        let popupPosition = fromLonLat([json.lng, json.lat]);
        var popupText =
          "<h4><strong>" +
          JSON.stringify(json.tip_via) +
          JSON.stringify(json.address) +
          ", " +
          JSON.stringify(json.portalNumber) +
          "</strong></h4>" +
          "<p>" +
          JSON.stringify(json.muni) +
          ", " +
          JSON.stringify(json.province) +
          "," +
          JSON.stringify(json.postalCode) +
          ", " +
          JSON.stringify(json.comunidadAutonoma) +
          "</p>";

        var contentLocation = document.getElementById("popup-content");
        contentLocation.innerHTML = popupText;
        overlay.setPosition(popupPosition);
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

    return () => {
      if (map) {
        map.removeLayer(tileLayer);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    console.log("Activado? " + allowRevGeo);

    map.addOverlay(overlay);

    if (allowRevGeo === true) {
      //obtenemos la uniqueKey del evento
      var evtKey = map.on("singleclick", (evt) => {
        selectProveedor(evt, gvSigUrl, overlay);
      });
      console.log(type);
      setKeyEvent(evtKey);
    }
    if (allowRevGeo === false) {
      //función que deshace el evento pasandole su key
      unByKey(keyEvent);
      overlay.setPosition(null);

      /* ESTOS MÉTODOS NO FUNCIONAN
        map.removeEventListener('singleclick');
        map.un("singleclick", (evt) => {
          reverseGeocode(evt, gvSigUrl);
        })
        */
    }
    return () => {
      if (map) {
        map.un("singleclick", (evt) => {
          selectProveedor(evt, gvSigUrl, overlay);
          reverseGeocode(gvSigUrl, overlay);
        });
      }
    };
  }, [allowRevGeo]);

  return null;
};
export default TileLayer;
