import React, {useState, useContext} from 'react'
import { Input, AutoComplete } from 'antd';
import 'antd/dist/antd.css';
import Map from "../Map";
import MapContext from "../Map/MapContext";
import { Layers, TileLayer, VectorLayer} from "../Layers";
import { fromLonLat, get } from 'ol/proj';
import { osm, vector } from "../Source";
import { Button, Tooltip } from 'antd';
import {PushpinOutlined} from '@ant-design/icons'


const SearchBox = () => {

  const [options, setOptions] = useState(); 
  const [gvSigUrl, setGvSigUrl] = useState("https://localhost/gvsigonline");
  const [center, setCenter] = useState([-3.70256, 40.4165,]);
  const [zoom, setZoom] = useState(6);
  const [resultsSearch, setResultsSearch]=useState();


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
       
        console.log("Coordenadas ->"+coordenadas);
          alert(
            "Toca hacer zoom en" + coordenadas

          );
      })
      .catch((err) => console.error(err.message));
    // return new Promise((resolve, reject) => {});
  }
  
/*
  const handleClick = () => {
    const { map } = useContext(MapContext); 
    map.on('singleclick', function(evt) {
      alert('HOLA')
      });
  }
*/
  return (
    <div className="App">
      <div>
      <AutoComplete
        dropdownClassName="certain-category-search-dropdown"
        dropdownMatchSelectWidth={500}
        style={{
          width: 250,
        }}
        options={options}
        onChange={(text)=>lookup(text)}
        onSelect={(value)=>geocode(value)}
      >
       <Input.Search allowClear size="large" placeholder="input here"/>
      </AutoComplete>

      <Tooltip title="Geocodificador inverso">
          <Button type="primary" shape="circle" icon={<PushpinOutlined/>} />
      </Tooltip>
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
            />
        </Layers>

      </Map>

    </div>
  </div>
  )
}

export default SearchBox
