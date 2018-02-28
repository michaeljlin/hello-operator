import domain from "../../domain";

function Fetcher(){

    // Payload parameter is optional
    // Only required when using join call which requires game uuid

    this.get = function(action, payload){

        console.log('fetching action: ', action);
        console.log('with payload: ', payload);

        let token = sessionStorage.getItem('jwt');

        console.log('and token: ', token);

        let body = {token: token};

        if(action === 'join'){
            body.gameID = payload
        }

        return fetch('/api/game/'+action,{
            method: 'POST',
            // mode: 'no-cors', // Only enable this for local debugging purposes
            body: JSON.stringify(body),
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': 'JWT '+token
            })
        }).catch((error)=>{
            console.error('Create game error: ', error);
        }).then((response)=>{
            console.log('got response from authentication: ', response);
            return response.json();
        }).then((data)=>{
            console.log('data says: ', data);

            if(data.token !== undefined){
                sessionStorage.removeItem('jwt');
                sessionStorage.setItem('jwt', data.token);
            }

            return data;
        });
    }

}

const fetcher = new Fetcher();
export default fetcher;