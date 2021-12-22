import React from "react";
import { Menu, Button, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export default() => {
    return(
        <Menu stackable style={{ marginTop: '50px' }}>
            <Button color="blue" as={Link} to='/'>Gestión de Tokens ERC-20</Button>
            <Button color="green" as={Link} to='/loteria'>Gestión de Boletos</Button>
            <Button color="orange" as={Link} to='/premios'>Premios de Lotería</Button>
            <Button color="linkedin" as={Link} href="https://www.linkedin.com/in/patricio0312rev/"><Icon name="linkedin"/>LinkedIn</Button>
            <Button color="red" as={Link} href="https://www.instagram.com/patricio0312rev/"><Icon name="instagram"/>Instagram</Button>
            <Button color="twitter" as={Link} href="https://www.twitter.com/patricio0312rev/"><Icon name="twitter"/>Twitter</Button>
        </Menu>
    );
}