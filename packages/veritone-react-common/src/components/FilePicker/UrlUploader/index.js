import React, { Component } from 'react';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import mime from 'mime-types';
import { func, arrayOf, string } from 'prop-types';

import styles from './styles.scss';

class UrlUploader extends Component {
  static propTypes = {
    onUpload: func.isRequired,
    acceptedFileTypes: arrayOf(string)
  };

  static defaultProps = {
    acceptedFileTypes: []
  };

  state = {
    image: '',
    fetchingImage: false,
    uploadError: false
  };

  preventInput = evt => {
    // todo: a "retrieve" button so we can have manual input without pasting
    evt.preventDefault();
  };

  handlePaste = evt => {
    // todo: handle fetchingImage state -- set to a timestamp, show loading > 200ms?
    this.setState({
      image: '',
      fetchingImage: true
    });

    const imageUrl = evt.clipboardData.getData('Text');

    fetch(imageUrl)
      .then(response => {
        if (response.status === 200 || response.status === 0) {
          return response.blob();
        } else {
          throw new Error(`Error loading: ${imageUrl}`);
        }
      })
      .then(responseBlob => {
        if (this.validateFileType(responseBlob.type)) {
          return responseBlob;
        } else {
          throw new Error(`${imageUrl} did match any of the allowed fileTypes`);
        }
      })
      .then(responseBlob => {
        let fileReader = new FileReader();
        fileReader.onload = () => {
          this.setState({
            image: fileReader.result,
            fetchingImage: false,
            uploadError: false
          });
        };

        fileReader.readAsDataURL(responseBlob);
        return responseBlob;
      })
      .then(responseBlob => {
        const fileType = responseBlob.type;
        const extension = mime.extension(fileType);
        // make an attempt to extract a useful filename (if url has an extension),
        // otherwise use the URL.
        // https://stackoverflow.com/questions/14473180/regex-to-get-a-filename-from-a-url
        const tryFilename = /(?=\w+\.\w{3,4}$).+/;
        const urlFileName = imageUrl.match(tryFilename);
        const fileName = urlFileName || `${imageUrl}.${extension}`;

        this.props.onUpload(
          new File([responseBlob], fileName, {
            type: fileType
          })
        );

        return responseBlob;
      })
      .catch(error => {
        console.log(error);
        // todo: better errors
        this.setState({
          fetchingImage: false,
          uploadError: true
        });
      });
  };

  handleChange = evt => {
    if (this.state.uploadError && !evt.target.value.length) {
      this.setState({
        image: '',
        uploadError: false
      });
    }
  };

  validateFileType = fileType => {
    if (this.props.acceptedFileTypes.length) {
      return this.props.acceptedFileTypes.includes(fileType);
    } else {
      return true;
    }
  };

  render() {
    return (
      <div className={styles.urlUploader}>
        <FormControl
          className={styles.urlTextField}
          error={this.state.uploadError}
        >
          <InputLabel
            FormLabelClasses={{
              error: styles.fileUrlInputError,
              focused: styles.fileUrlInputFocused
            }}
            htmlFor="url-input"
          >
            Paste an Image URL here
          </InputLabel>
          <Input
            classes={{
              root: styles.fileUrlPickerInputRoot,
              input: styles.fileUlrPickerInput
            }}
            id="url-input"
            onKeyPress={this.preventInput}
            onPaste={this.handlePaste}
            onChange={this.handleChange}
          />
        </FormControl>
        {this.state.image.length ? (
          <div className={styles.imageContainer}>
            <div className={styles.fileImage}>
              <img src={this.state.image} />
            </div>
          </div>
        ) : (
          <div className={styles.urlUploaderInfoBox}>
            <span className={styles.correctUrlText}>
              If the URL is correct the image will display here.
            </span>
            <span className={styles.confirmLicenseText}>
              Remember, only use images that you have confirmed that you have
              the license to use
            </span>
          </div>
        )}
      </div>
    );
  }
}

export default UrlUploader;
