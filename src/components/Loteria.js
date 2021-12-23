import React, {Component} from "react";
import './App.css';
import Web3 from 'web3';
import contratoLoteria from '../abis/Loteria.json';
import { Icon } from "semantic-ui-react";
import tokens from '../img/loteria.png';

class Loteria extends Component {
    async componentWillMount(){
        // 1. Carga de Web3
        await this.loadWeb3();
        // 2. Carga de datos de la Blockchain
        await this.loadBlockchainData();
    }

    // 1. Carga de Web3
    async loadWeb3(){
        if(window.ethereum){
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if(window.web3){
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert('¡No hay ningun navegador de blockchain detectado. Deberias considerar usar Metamask!');
        }
    }

    // 2. Carga de datos de la Blockchain
    async loadBlockchainData(){
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();

        this.setState({account: accounts[0]});
        console.log('Account: ', this.state.account);

        const networkId = '5777'; // Ganache => 5777 | Rinkeby => 4 | BSC => 97
        console.log('NetworkId: ', networkId);

        const networkData = contratoLoteria.networks[networkId];
        console.log('NetworkData: ', networkData);

        if(networkData){
            const abi = contratoLoteria.abi;
            console.log('Abi:', abi);

            const address = networkData.address;
            console.log('Address: ', address);

            const contract = new web3.eth.Contract(abi,address);
            this.setState({contract});
        } else {
            window.alert('¡El Smart Contract no se ha desplegado en la red');
        }
    }

    // Constructor
    constructor(props) {
        super(props);
        this.state = {
            contract: null,
            loading: false,
            errorMessage: '',
            account: '',
        }
    }

    render() {
        return(
            <p>Gestión de Boletos</p>
        );
    }
}

export default Loteria;