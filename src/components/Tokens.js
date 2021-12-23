import React, {Component} from "react";
import './App.css';
import Web3 from 'web3';
import contratoLoteria from '../abis/Loteria.json';
import { Icon } from "semantic-ui-react";
import tokens from '../img/tokens.png';

class Tokens extends Component {
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
            buyer: '',
            quantity: 0,
        }
    }

    // Funcion para realizar la compra de tokens
    envio = async(comprador, cantidad, ethers, mensaje) => {
        try{
            console.log(mensaje);
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();

            await this.state.contract.methods.comprarTokens(comprador, cantidad).send({from: accounts[0], value: ethers});
        } catch(err){
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
            console.log('loading', false);
        }
    }

    // Funcion para visualizar el número de tokens que tiene un usuario
    balanceUsuario = async(direccion, mensaje) => {
        try{
            console.log(mensaje);
            const balance = await this.state.contract.methods.misTokens(direccion).call();

            alert(parseFloat(balance));
        } catch(err){
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
            console.log('loading', false);
        }
    }

    // Funcion para visualizar el número de tokens que tiene el contrato
    balanceContrato = async(mensaje) => {
        try{
            console.log(mensaje);
            const balance = await this.state.contract.methods.tokensDisponibles().call();

            alert(parseFloat(balance));
        } catch(err){
            this.setState({errorMessage: err.message});
        } finally {
            this.setState({loading: false});
            console.log('loading', false);
        }
    }


    // Render de la DApp
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

                                <h2>Gestión y control de Tokens de la Lotería</h2>
                                <a href="https://www.linkedin.com/in/patricio0312rev/" target="_blank" rel="noopener noreferrer">
                                    <p></p>
                                    <img src={tokens} width="450" heigth="400" alt="/"></img>
                                </a>
                                <p></p>

                                <h3><Icon circular inverted color='red' name='dollar' />Compra de Tokens ERC-20</h3>
                                <form onSubmit={(event) => {
                                    event.preventDefault();
                                    const compradorTokens = this.comprador.value;
                                    const cantidad = this.cantidad.value;
                                    const web3 = window.web3;
                                    const ethers = web3.utils.toWei(this.cantidad.value, 'ether');
                                    const mensaje = "Compra de tokens en ejecución...";
                                    this.envio(compradorTokens, cantidad, ethers, mensaje);
                                }}>
                                    <input 
                                        type="text" 
                                        className="form-control mb-1" 
                                        placeholder="Dirección de envío de los tokens" 
                                        ref={(input) => this.comprador = input} 
                                    />
                                    
                                    <input 
                                        type="text" 
                                        className="form-control mb-1" 
                                        placeholder="Cantidad de tokens a comprar" 
                                        ref={(input) => this.cantidad = input} 
                                    />
                                    
                                    <input 
                                        type="submit" 
                                        className="bbtn btn-block btn-danger btn-sm" 
                                        value="Comprar tokens"
                                    />
                                </form>

                                <br></br>

                                <h3><Icon circular inverted color='orange' name='bitcoin' />Balance de tokens de un usuario</h3>
                                <form onSubmit={(event) => {
                                    event.preventDefault();
                                    const balanceDireccion = this.balance.value;
                                    const mensaje = "Búsqueda del balance del usuario en ejecución...";
                                    this.balanceUsuario(balanceDireccion, mensaje);
                                }}>
                                    <input 
                                        type="text" 
                                        className="form-control mb-1" 
                                        placeholder="Dirección del usuario" 
                                        ref={(input) => this.balance = input} 
                                    />
                                    
                                    <input 
                                        type="submit" 
                                        className="bbtn btn-block btn-warning btn-sm" 
                                        value="Ver balance"
                                    />
                                </form>

                                <br></br>

                                <h3><Icon circular inverted color='green' name='ethereum' />Balance de tokens del Smart Contract</h3>
                                <form onSubmit={(event) => {
                                    event.preventDefault();
                                    const mensaje = "Búsqueda del balance del Smart Contract en ejecución...";
                                    this.balanceContrato(mensaje);
                                }}>
                                    
                                    <input 
                                        type="submit" 
                                        className="bbtn btn-block btn-success btn-sm" 
                                        value="Ver balance"
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

export default Tokens;