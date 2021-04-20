import Geolookup from "react-geolookup-v2";
// import Cookies from "js-cookie";

export default function SearchGvsig() {
 
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
    "https://centos7.gvsigonline.com/gvsigonline"
  );

  const getSuggestLabel = (s) => {
    return s.address;
  };

  return (
    <div className="App">
      <Geolookup
        inputClassName="geolookup__input"
        disableAutoLookup={false}
        getSuggestLabel={getSuggestLabel}
        geocodeProvider={myProvider}
        radius="20"
      />
    </div>
  );
}
