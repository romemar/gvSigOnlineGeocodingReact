import React, {useState, useContext} from 'react'
import "../../src/App.css"
//Modulo Ant Design ---- https://ant.design/
import {ClearOutlined} from '@ant-design/icons'
import { Input, AutoComplete } from 'antd';
import 'antd/dist/antd.css';
import { Button, Tooltip } from 'antd';
//Usamos OpenLayers para incluir mapa  
import Map from "../Map";
import { osm, vector } from "../Source";
import { fromLonLat, get, toLonLat } from 'ol/proj';
import { Layers, TileLayer, VectorLayer, RevGeocodingLayer} from "../Layers";
import { Circle as CircleStyle, Fill, Stroke, Style, Icon} from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from "ol/Overlay";
//instalamos paquete @fortawesome/react-fontawesome' para usar iconos de 
//https://fontawesome.com/icons?d=gallery&p=2
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMap, faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons'

const SearchBox = () => {

  const [options, setOptions] = useState(); 
  const [gvSigUrl, setGvSigUrl] = useState("https://localhost/gvsigonline");
  const [center, setCenter] = useState([-3.70256, 40.4165]);
  const [zoom, setZoom] = useState(6);
  const [searchText, setSearchText]=useState('');
  const [resultsSearch, setResultsSearch]=useState();
  const [showLayer, setShowLayer] = useState(false);
  const [geojsonObject, setGeojsonObject]= useState();
  const [reverseGeocodingOn, setReverseGeocodingOn]= useState(false);


  const renderTitle = (title) => (
    <span>
      {title}
    </span>
  );

  const renderItem = (s) => ({
    key:s.id,
    value: s.address,
    label: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {s.address}
      </div>
    ),
  });

  const lookup = async (userInput) =>{

    const candidatos = [];
  
    let response = await fetch(
      gvSigUrl + "/geocoding/search_candidates/?limit=10&q=" + userInput
    );
  
    let json = await response.json();
    console.log(json);
    let results = json.suggestions;
    setResultsSearch(results)
    console.log(resultsSearch)

    let optionNominatim = []
    let optionCartociudad = []
    let optionGoogle = []

    if (results.length > 0) {
      results.map((suggest) => {
        
      if (suggest.category==="Nominatim"){
        
        optionNominatim.push(renderItem(suggest))
      }
      if (suggest.category==="Cartociudad"){
        
        optionCartociudad.push(renderItem(suggest))
      }
      if (suggest.category==="Google"){
        
        optionGoogle.push(renderItem(suggest))
      }
      
      }
      )

      candidatos.push({
        label: renderTitle('Nominatim'),
        options: optionNominatim,
      })
      candidatos.push({
        label: renderTitle('Cartociudad'),
        options: optionCartociudad,
      })
      candidatos.push({
        label: renderTitle('Google'),
        options: optionGoogle,
      })

    }
     // if
    setOptions(candidatos);
    
  } 
 

// Con Geolookup las opciones de la lista () const getSuggestLabel = (s) => return s.address;};
// EN ESTE CASO NUESTRA LISTA NO SON OBJECTOS, ES UN TITULO(Texto) CON LA DIRECCIÓN DEL OBJETO

  const geocode = (value) => {

    if (showLayer){
      setShowLayer(false)
    }
    //recorremos el array de resultados en busca de la localización seleccionada
    //HABRÁ QUE BUSCAR EL OBJETO DENTRO DE RESULTS (USAREMOS useState)
    let suggest=[]

    for (var i=0; i < resultsSearch.length; i++){

      if (resultsSearch[i].address === value){
        suggest.push(resultsSearch[i])
        console.log(resultsSearch[i]);
      }
    }

    console.log(" geocode de " + JSON.stringify(suggest));
    // TODO: Aquí tenemos que pillar el suggest.raw y
    // obtener el idcalle, id, etc para buscar
    // las coordenadas de una dirección y luego llamar al zoom
    // let csrftoken = Cookies.get("csrftoken");

    // FJP: Esta parte es probable que tenga que cambiarse en gvSIG Online. Jose envía de una forma muy rara
    // la dirección:
    
    let formBody = [];
    for (let property in suggest[0]) {
      var encodedKey = encodeURIComponent("address[" + property + "]");
      let encodedValue = encodeURIComponent(suggest[0][property]);
      if (suggest[0][property] == null) formBody.push(encodedKey + "=");
      else formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    console.log(formBody);

    return fetch(gvSigUrl + "/geocoding/find_candidate/", {
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
        setGeojsonObject({
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {},
              "geometry": {
                "type": "Point",
                "coordinates": [
                  encontrados.lng,
                  encontrados.lat]
              }
            }
          ]
      })
        setShowLayer(true)
       
        console.log("Coordenadas ->"+coordenadas);
        //alert("Toca hacer zoom en" + coordenadas);

      })
      .catch((err) => console.error(err.message));
    // return new Promise((resolve, reject) => {});
  }

  //función borrar datos de búsqueda y volver a zoom inicial
  const onCLickDelete = () => {
    setCenter([-3.70256, 40.4165,]);
    setZoom(6);
    setSearchText('');
    setOptions([]);
    setResultsSearch();
    setShowLayer(false)
  } 

  return (
    <div className="App">
      <div>
      <AutoComplete
        value={searchText}
        dropdownClassName="certain-category-search-dropdown"
        dropdownMatchSelectWidth={500}
        style={{
          marginTop:20,
          width: 350,
          textAlign:'left',
        }}
        options={options}
        onChange={(text)=>{
                  lookup(text)
                  setSearchText(text)}}
        onSelect={(value)=>{geocode(value)}}
      >

       {resultsSearch? 
          <Input
              size="large" 
              placeholder="Buscar..."
              suffix={
              <Tooltip title="Borrar">
                <Button size='small'  shape="circle" icon={<ClearOutlined/>} onClick={onCLickDelete}/>
              </Tooltip>
              }  
              addonAfter={
                <Tooltip title="Geocodificador inverso">
                  {reverseGeocodingOn ?  
                    <Button 
                      style={{marginLeft:5}} 
                      shape="circle" 
                      icon={<FontAwesomeIcon icon={faMapMarkedAlt}/>} 
                      onClick={()=> {setReverseGeocodingOn(false); console.log('Geocodificador inverso desactivado')}}/> 
                      :
                    <Button 
                      style={{marginLeft:5}} 
                      type="primary" 
                      shape="circle" 
                      icon={<FontAwesomeIcon icon={faMapMarkedAlt}/>} 
                      onClick={()=> {setReverseGeocodingOn(true); console.log('Geocodificador inverso activado')}}/> 
                  }
                </Tooltip> }
            /> 
          :
          <Input
              size="large" 
              placeholder="Buscar..." 
              addonAfter={
                <Tooltip title="Geocodificador inverso">
                  {reverseGeocodingOn ?  
                    <Button 
                      style={{marginLeft:5}} 
                      shape="circle" 
                      icon={<FontAwesomeIcon icon={faMapMarkedAlt}/>} 
                      onClick={()=> {setReverseGeocodingOn(false); console.log('Geocodificador inverso desactivado')}}/> 
                      :
                    <Button 
                      style={{marginLeft:5}} 
                      type="primary" 
                      shape="circle" 
                      icon={<FontAwesomeIcon icon={faMapMarkedAlt}/>} 
                      onClick={()=> {setReverseGeocodingOn(true); console.log('Geocodificador inverso activado');}}/> 
                  }
                </Tooltip> }/>
        } 
      </AutoComplete>
      </div>

    <div>
      <Map 
        center={fromLonLat(center)} 
        zoom={zoom}
      >
        <Layers>
              <TileLayer
                source={osm()}
                zIndex={0} 
                geoOn={reverseGeocodingOn}
                url={gvSigUrl}
                center={center}
              />
            {showLayer && (
            <VectorLayer
              source={vector({ features: new GeoJSON().readFeatures(geojsonObject, { featureProjection: get('EPSG:3857') }) })}
              style={styles.Point}
            />
            )}

        </Layers>
      </Map>
     
    </div>
  </div>
  )
}

let styles = {
	'Point': new Style({
		image: new CircleStyle({
			radius: 6,
			fill: new Fill({color: 'red'}),
			stroke: new Stroke({
				color: [0,0,0], width: 2
			}),
		}),
	}),
  'icon': new Style({
    image: new Icon({
      anchor: [1, 6],
      src: '../data/marker.png',
    }),
  }),
};

export default SearchBox
