import { useContext, useEffect } from "react";
import MapContext from "../Map/MapContext";
import OLTileLayer from "ol/layer/Tile";
import {fromLonLat, toLonLat} from 'ol/proj';

const reverseGeocode = (evt, url) => {

  var coord = toLonLat(evt.coordinate);
  var type = 'new_cartociudad'

  let formBody = [];

  var encodedKeyCoord = encodeURIComponent(coord);
  formBody.push("coord=" + encodedKeyCoord);

  var encodedKeyType = encodeURIComponent(type);
  formBody.push("type=" + encodedKeyType);

  formBody = formBody.join("&");
   //coord=-2.774274873462422%2C41.56326798105209&type=new_cartociudad
  console.log('FORM_BODY==> '+formBody);

  return fetch(url + "/geocoding/get_location_address/", {
    method: "POST",
    headers: {
      //"Content-Type": "application/json"
      "Content-Type": "application/x-www-form-urlencoded"
      // "X-CSRFToken": csrftoken
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: formBody // body data type must match "Content-Type" header
  })
    .then((response) => response.json())
    .then((json) => {
      console.log("get_location_address: " + JSON.stringify(json));

      //setCenter(fromLonLat([json.lng,json.lat]))
      //setZoom(14)
      let coordLocation = [json.lng, json.lat]
      console.log(coordLocation)

      alert('Dirección: '+JSON.stringify(json.address)+
      '\n'+ JSON.stringify(json.muni)+', '+JSON.stringify(json.province)+
      '\n'+JSON.stringify(json.postalCode)+', '+JSON.stringify(json.comunidadAutonoma)+', Coordenadas: '+coordLocation)

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

  }

const TileLayer = ({ source, zIndex = 0, geoOn, url, setCenter}) => {
  const { map } = useContext(MapContext); 
  
  const allowRevGeo = geoOn
  const gvSigUrl = url
  
  useEffect(() => {
    if (!map) return;
    
    let tileLayer = new OLTileLayer({
      source,
      zIndex,
      allowRevGeo, 
      setCenter
    });

    console.log('Activado? '+allowRevGeo)
    
    //if(allowRevGeo){
      map.on("singleclick", evt => {
        reverseGeocode(evt, gvSigUrl)

      });
   //}
    map.addLayer(tileLayer);

    
    tileLayer.setZIndex(zIndex);
    return () => {
      if (map) {
        map.removeLayer(tileLayer);
      }
    };
  }, [map]);
  return null;
};
export default TileLayer;