// SPDX-License-Identifier: MIT
pragma solidity >0.4.4 <0.7.0;
pragma experimental ABIEncoderV2;
import "./ERC20.sol";

contract Loteria {

    // Instancia del contrato Token
    ERC20Basic private token;

    // Direcciones
    address public owner;
    address public contrato;
    address public direccionGanador;

    // Número de tokens a crear
    uint public tokens_creados = 10000;

    // Evento de compra de tokens
    event ComprandoTokens(uint, address);

    constructor() public {
        token = new ERC20Basic(tokens_creados);
        owner = msg.sender;
        contrato = address(this);
    }

    // ------------- TOKEN ------------- 
    // Estableciendo precio del token
    function precioTokens(uint _numTokens) internal pure returns(uint){
        return _numTokens*(1 ether);
    }

    // Generar más tokens por la loteria
    function generarTokens(uint _numTokens) public Unicamente(msg.sender){
        token.increaseTotalSupply(_numTokens);
    }

    // Modificador para hacer funciones solamente accesibles por el owner del contrato
    modifier Unicamente(address _direccion){
        require(_direccion == owner, "No tienes permisos para ejecutar esta funcion");
        _;
    }

    // Comprar tokens para comprar boletos/tickets para la loteria
    function comprarTokens(address _propietario, uint _numTokens) public payable {
        // Calcular el coste de los tokens
        uint costo = precioTokens(_numTokens);
        // Se requiere que el valor de ethers pagados sea equivalente al coste
        require(msg.value >= costo, "Compra menos tokens o paga con mas ethers");
        // Diferencia a pagar
        uint returnValue = msg.value - costo;
        // Transferencia de la diferencia
        msg.sender.transfer(returnValue);
        // Obtener el balance de tokens del contrato
        uint balance = tokensDisponibles();
        // Filtro para evaluar los tokens a comprar con los tokens disponibles
        require(_numTokens <= balance, "Compra un número de tokens adecuado");
        // Transferencia de tokens al comprador
        token.transfer(_propietario, _numTokens);
        // Emitir el evento de compra de tokens
        emit ComprandoTokens(_numTokens, _propietario);
    }

    // Balance de tokens en el contrato de loteria
    function tokensDisponibles() public view returns(uint){
        return token.balanceOf(contrato);
    }

    // Obtener el balance de tokens acumulados en el bote
    function bote() public view returns(uint){
        return token.balanceOf(owner);
    }

    // Ver la cantidad de tokens de un usuario
    function misTokens(address _propietario) public view returns(uint){
        return token.balanceOf(_propietario);
    }

    // ------------- LOTERIA ------------- 
    // Precio de boleto en tokens
    uint public precioBoleto = 5;
    // Relacion entre la persona que compra los boletos y los numeros de los boletos
    mapping(address => uint[]) idPersona_boletos;
    // Relacion necesaria para identificar al ganador
    mapping(uint => address) ADN_boleto;
    // Numero aleatorio
    uint randNonce = 0;
    // Registro de los boletos generados
    uint[] boletosComprados;
    // Eventos
    event boletoComprado(uint, address);        // Evento cuando se compran boletos
    event boletoGanador(uint);                  // Evento del ganador
    event tokensDevueltos(uint, address);       // Evento para devoler los tokens

    // Comprar boletos
    function comprarBoletos(uint _boletos) public {
        // Precio total de los boletos a comprar
        uint precioTotal = _boletos*precioBoleto;
        // Filtrado de los tokens a pagar
        require(precioTotal <= misTokens(msg.sender), "Necesitas comprar mas tokens.");

        // Transferencia de tokens al owner -> bote/premio 
        /* 
        El cliente paga el boleto en tokens:
        - Ha sido necesario crear una funcion en ERC20.sol con el nombre de 'transferLoteria' 
        debido a que en caso de usar el transfer o transferFrom las direcciones que se escogían
        para realizar la transacción eran equivocadas. Ya que el msg.sender que recibia el metodo 
        transferFrom era la dirección del contrato. Y debe ser la dirección de la persona física.
        */
        token.transferLoteria(msg.sender, owner, precioTotal);

        /* 
        Lo que haria esto es tomar la marca del tiempo actual (now), el msg.sender y un nonce.
        Es un número que solo se utiliza una vez para que no ejecutes dos veces la misma función
        de hash con los mismos parámetros de entrada en incremento. 
        Luego se utiliza keccak256 para convertir estas entradas a un hash aleatorio, convertir
        ese hash a un uint y luego utilizamos % 10000 para tomar los últimos 4 dígitos.
        Dando un valor aleatorio entre 0 - 9999.
        */
        for(uint i=0; i < _boletos; i++){
            uint random = uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % 10000;
            randNonce++;
            // Almacenamos los datos de los boletos
            idPersona_boletos[msg.sender].push(random);
            // Numero de boleto comprado
            boletosComprados.push(random);
            // Asignacion del ADN del boleto para tener un ganador
            ADN_boleto[random] = msg.sender;
            // Emision del evento
            emit boletoComprado(random, msg.sender);
        }
    }

    // Visualizar el numero de boletos de una persona
    function tusBoletos() public view returns(uint[] memory){
        return idPersona_boletos[msg.sender];
    }

    // Generar un ganador e ingresarle los tokens
    function generarGanador() public Unicamente(msg.sender){
        // Debe haber boletos comprados para generar un ganador
        require(boletosComprados.length > 0, "No hay boletos comprados");
        // Declaracion de la longitud del array
        uint longitud = boletosComprados.length;
        // Aleatoriamente elijo un numero entre 0 y la longitud
        // 1 - Eleccion de una posicion aleatoria del array
        uint posicionArray = uint(uint(keccak256(abi.encodePacked(now))) % longitud);
        // 2 - Seleccion del numero aleatorio mediante la posicion del array aleatoria
        uint eleccion = boletosComprados[posicionArray];

        // Emision del evento del gamador
        emit boletoGanador(eleccion);
        // Recuperar la direccion del ganador
        direccionGanador = ADN_boleto[eleccion];
        // Enviarle los tokens del premio al ganador
        token.transferLoteria(msg.sender, direccionGanador, bote());
    }

    // Devolucion de los tokens
    function devolverTokens(uint _numTokens) public payable{
        // El numero de tokens a devolver debe ser mayor a 0
        require(_numTokens > 0, "Necesitas devolver un numero positivo de tokens");
        // El usuario debe tener los tokens que desea devolver
        require(_numTokens <= misTokens(msg.sender), "No tienes la cantidad de tokens que deseas devolver.");

        // DEVOLUCION:
        // 1. El cliente devuelve los tokens
        // 2. La loteria paga los tokens devueltos
        token.transferLoteria(msg.sender, address(this), _numTokens);
        msg.sender.transfer(precioTokens(_numTokens));
        // Emision del evento
        emit tokensDevueltos(_numTokens, msg.sender);
    }
}