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

    // Funcion para visualizar el bote de la lotería
    bote = async(mensaje) => {
        try {
            console.log(mensaje);
            const boteLoteria = await this.state.contract.methods.bote().call();
            alert(parseFloat(boteLoteria));
        } catch(err) {
            this.setState({errorMessage: err.message})
        } finally {
            this.setState({loading: false});
        }
    }

    // Visualizar el precio del boleto
    precioBoleto = async(mensaje) => {
        try {
            console.log(mensaje);
            const precio = await this.state.contract.methods.precioBoleto().call();
            alert(parseFloat(precio));
        } catch(err) {
            this.setState({errorMessage: err.message})
        } finally {
            this.setState({loading: false});
        }
    }

    // Comprar boletos
    compraBoletos = async(cantidadBoletos, mensaje) => {
        try {
            console.log(mensaje);
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            await this.state.contract.methods.comprarBoletos(cantidadBoletos).send({from: accounts[0]});
            alert('¡Mucha suerte!');
        } catch(err) {
            this.setState({errorMessage: err.message})
        } finally {
            this.setState({loading: false});
        }
    }


    render() {
        return(
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <a
                        className="navbar-brand col-sm-3 col-md-2 mr-0"
                        href="https://frogames.es/rutas-de-aprendizaje"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        DApp
                    </a>
        
                    <ul className="navbar-nav px-3"> 
                        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                            <small className="text-white"><span id="account">Cuenta activa: {this.state.account}</span></small>
                        </li>
                    </ul>
                </nav>

                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                            <div className="content mr-auto ml-auto">
                                <h1>Lotería con Tokens ERC-20</h1>

                                <h2>Gestión y control de los Boletos de la Lotería</h2>
                                <a href="https://www.linkedin.com/in/patricio0312rev/" target="_blank" rel="noopener noreferrer">
                                    <p></p>
                                    <img src={tokens} width="500" heigth="350" alt="/"></img>
                                </a>
                                <p></p>

                                <h3><Icon circular inverted color='blue' name='eye' />Ver Bote de la Lotería</h3>
                                <form onSubmit={(event) => {
                                    event.preventDefault();
                                    const mensaje = "Bote total de la Lotería en ejecución...";
                                    this.bote(mensaje);
                                }}>
                                    
                                    <input 
                                        type="submit" 
                                        className="bbtn btn-block btn-primary btn-sm" 
                                        value="Ver bote"
                                    />
                                </form>

                                <br></br>

                                <h3><Icon circular inverted color='teal' name='money bill alternate outline' />Ver Precio del Boleto</h3>
                                <form onSubmit={(event) => {
                                    event.preventDefault();
                                    const mensaje = "Precio del Boleto de la Lotería en ejecución...";
                                    this.precioBoleto(mensaje);
                                }}>
                                    
                                    <input 
                                        type="submit" 
                                        className="bbtn btn-block btn-info btn-sm" 
                                        value="Ver precio"
                                    />
                                </form>

                                <br></br>

                                <h3><Icon circular inverted color='orange' name='payment' />Compra de Boletos</h3>
                                <form onSubmit={(event) => {
                                    event.preventDefault();
                                    const cantidad = this.cantidad.value;
                                    const mensaje = "Compra de boletos en ejecución...";
                                    this.compraBoletos(cantidad, mensaje);
                                }}>                       
                                    <input 
                                        type="text" 
                                        className="form-control mb-1" 
                                        placeholder="Cantidad de boletos a comprar" 
                                        ref={(input) => this.cantidad = input} 
                                    />
                                    
                                    <input 
                                        type="submit" 
                                        className="bbtn btn-block btn-warning btn-sm" 
                                        value="Comprar boletos"
                                    />
                                </form>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

export default Loteria;