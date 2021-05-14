import React, { useContext, useEffect, useState } from "react";
import MapContext from "../Map/MapContext";
import OLTileLayer from "ol/layer/Tile";
import { fromLonLat, toLonLat } from "ol/proj";
import { unByKey } from "ol/Observable";

const TileLayer = ({ source, zIndex = 0, geoOn, url, center }) => {
  const { map, overlay } = useContext(MapContext);

  const allowRevGeo = geoOn;
  const gvSigUrl = url;
  const [keyEvent, setKeyEvent] = useState();

  //--------función geocodificador inverso--------------

  const reverseGeocode = (evt, url, overlay) => {
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

        let popupPosition = fromLonLat([json.lng, json.lat]);

        console.log(popupPosition);

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

        var content = document.getElementById("popup-content");
        content.innerHTML = popupText;
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
        reverseGeocode(evt, gvSigUrl, overlay);
      });

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
          reverseGeocode(evt, gvSigUrl);
        });
      }
    };
  }, [allowRevGeo]);

  return null;
};
export default TileLayer;
