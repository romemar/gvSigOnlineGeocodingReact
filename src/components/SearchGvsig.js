import Geolookup from "react-geolookup-v2";
import {useState} from "react"
// import Cookies from "js-cookie";
import Map from "../Map";
import { Layers, TileLayer, VectorLayer} from "../Layers";
import { fromLonLat, get } from 'ol/proj';
import { osm, vector } from "../Source";

import SearchBox from './SearchBox'


export default function SearchGvsig() {

  const [center, setCenter] = useState([-3.70256, 40.4165,]);
  const [zoom, setZoom] = useState(6);
 // const [geojsonObject, setGeojsonObject]=useState({})
  //const [showLayer1, setShowLayer1] = useState(false);
  

  class gvSigGeocodeProvider {
    constructor(url) {
      this.gvSigUrl = url;
    }

    async lookup(userInput) {
      let response = await fetch(
        this.gvSigUrl + "/geocoding/search_candidates/?limit=10&q=" + userInput
      );

      let json = await response.json();
      console.log(json);
      if (json.suggestions && json.suggestions.length > 0) {
        return json.suggestions;
      } // if
    }

    geocode(suggest) {
      console.log(" geocode de " + JSON.stringify(suggest));
      // TODO: Aquí tenemos que pillar el suggest.raw y
      // obtener el idcalle, id, etc para buscar
      // las coordenadas de una dirección y luego llamar al zoom
      // let csrftoken = Cookies.get("csrftoken");

      // FJP: Esta parte es probable que tenga que cambiarse en gvSIG Online. Jose envía de una forma muy rara
      // la dirección:
      
      let formBody = [];
      for (let property in suggest.raw) {
        var encodedKey = encodeURIComponent("address[" + property + "]");
        let encodedValue = encodeURIComponent(suggest.raw[property]);
        if (suggest.raw[property] == null) formBody.push(encodedKey + "=");
        else formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");

      console.log(formBody);

      return fetch(this.gvSigUrl + "/geocoding/find_candidate/", {
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
          console.log("find_candidate: " + JSON.stringify(json));
          let encontrados = json.address;
          var coordenadas= "lat: "+encontrados.lat+" - lng: "+encontrados.lng;
          setCenter([encontrados.lng,encontrados.lat])
          setZoom(14)
         
          console.log("Coordenadas ->"+coordenadas);
            alert(
              "Toca hacer zoom en" + coordenadas

            );
        })
        .catch((err) => console.error(err.message));
      // return new Promise((resolve, reject) => {});
    }
  }
  const myProvider = new gvSigGeocodeProvider(
    "https://localhost/gvsigonline"
  );

  const getSuggestLabel = (s) => {
    return s.address;
  };

  return (
    <div className="App">

      <Map center={fromLonLat(center)} zoom={zoom}>
        <Geolookup
        inputClassName="geolookup__input"
        disableAutoLookup={false}
        getSuggestLabel={getSuggestLabel}
        geocodeProvider={myProvider}
        radius="20"
      />
				<Layers>
					<TileLayer
						source={osm()}
						zIndex={0}
					/>
				</Layers>
			</Map>

     
    </div>
  );
}

{/*  
import GeoJSON from 'ol/format/GeoJSON';
import {  Circle as CircleStyle, Stroke, Style } from 'ol/style';

let styles = {
	'Point': new Style({
		image: new CircleStyle({
			radius: 10,
			fill: null,
			stroke: new Stroke({
				color: 'magenta',
			}),
		}),
	})
};
--------dentro de método geocode------
 setGeojsonObject({"type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {
                "kind": "county",
                "name": "Wyandotte",
                "state": "KS"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [[encontrados.lng,encontrados.lat]]
              }
            }
          ]});
          showLayer1(true);
          console.log('Datos geojsonObject:'+{geojsonObject})

  ----------dentro de <Layers>
   {showLayer1 && (
						<VectorLayer
							source={vector({ features: new GeoJSON().readFeatures(geojsonObject, { featureProjection: get('EPSG:3857') }) })}
							style={styles.Point}
						/>
					)}

          <Geolookup
        inputClassName="geolookup__input"
        disableAutoLookup={false}
        getSuggestLabel={getSuggestLabel}
        geocodeProvider={myProvider}
        radius="20"
      />

*/}
