import React, { Component } from 'react';
import { MdInsertDriveFile } from 'react-icons/md';
import api from '../../services/api';
import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt'
import Dropzone from 'react-dropzone';
import socket from 'socket.io-client';

import './styles.css';
import logo from '../../assets/logo.svg';

export default class Box extends Component {
    state = {
        box: {}
    };

    async componentDidMount() {
        this.subscribeToNewFiles();

        const response = await api.get(`/boxes/${this.props.match.params.id}`);

        this.setState({ box: response.data });
    };

    subscribeToNewFiles = () => {
        const io = socket('https://omniweek-backend.herokuapp.com');

        io.emit('connectRoom', this.props.match.params.id);

        io.on('file', data => {
            this.setState({ box: { ...this.state.box, files: [data, ...this.state.box.files] } })
        })
    };

    handleUpload = (files) => {
        files.forEach(async file => {
            const data = new FormData();

            data.append('file', file);

            const response = await api.post(`/boxes/${this.props.match.params.id}/files`);

            console.log(response);
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        const response = await api.post('/boxes', {
            title: this.state.newBox
        });

        this.props.history.push(`box/${response.data._id}`)
    };

    render() {
        return (
            <div id="box-container">
                <header>
                    <img src={logo} alt="" />
                    <h1>{this.state.box.title}</h1>
                </header>

                <Dropzone onDropAccepted={this.handleUpload}>
                    {({getRootProps, getInputProps}) => (
                        <div className="upload" {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>Arraste arquivos ou clique aqui</p>
                        </div>
                    )}
                </Dropzone>

                <ul>
                    { this.state.box.files && this.state.box.files.map(file => (
                        <li key={file._id}>
                            <a className="fileInfo" href={file.url} target="_blank">
                                <MdInsertDriveFile size={24} color="#A5Cfff" />
                                <strong>{file.title}</strong>
                            </a>
                            <span>há {distanceInWords(file.createdAt, new Date(), {
                                locale: pt
                            })}</span>
                        </li>
                    )) }
                </ul>
            </div>
        );
    }
}