<template>
    <!-- 그림등록 -->
    <div class="image-container">
        <div>
            <label style="padding: 20px 10px 5px 0px">사업자 코드 등록</label>
            <input v-model="companyCode" type="text" />
            <br />
            <div class="image-upload">
                <div class="upload-plate">
                    <div class="main-remove-btn" @click="removePreviewImage">
                        <p id="removeImgBtn">X</p>
                    </div>
                    <label for="upload">
                        <div id="upload-wrapper" class="upload-wrapper">
                            <div>
                                <label for="upload" class="upload-label">
                                    <p style="padding-bottom: 5px; font-size: 24px; margin: 5px 0px">Click or Drag Here</p>
                                    <div id="image_preview" class="main-image_preview">
                                        <img id="image_previewAtimg" class="upload-img" src="@img/upload.svg" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </label>
                    <input id="upload" class="image-upload" style="display: none" type="file" accept="image/*" multiple="multiple" />
                    <div style="display: flex; justify-content: space-between; flex-wrap: nowrap">
                        <button id="removeAll" class="btn btn-outline-danger btn" style="display: block; margin-top: 10px" type="button">Remove All</button>
                        <button id="upload-file" class="btn btn-outline-primary btn" @click="uploadImages" style="display: block; margin-top: 10px; margin-right: 12px" type="button">UPLOAD</button>
                    </div>
                    <!-- <img src="nothing.png" height="10px" /> -->
                </div>
                <div class="upload-table">
                    <template v-for="(image, idx) in imageFilesList" :key="idx">
                        <div id="upload-wrapper-child" class="upload-wrapper-child" @click="selectImage($event, idx)">
                            <div class="remove-btn-child" @click="removeImage($event, idx)">
                                <span class="removeImgBtnChild">X</span>
                            </div>
                            <div id="image_preview" class="image_preview_chilidren">
                                <img id="image_previewAtimg" class="upload-img-child" :src="image.imgUrl" />
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div class="result-wrap">
            {{ uploadMessage }}
            <hr />
            <template v-for="(item, idx) in uploadedData" :key="idx">
                <div style="display: flex; flex-wrap: nowrap; flex-direction: column; align-items: center; margin-top: 10px">
                    <sapn style="user-select: none">{{ item.originFileName }}</sapn>
                    <div class="result-image-wrap" :style="'background-image: url(' + imageUrl + item.path + ')'"></div>
                    <!-- <div>
                    {{ item.originFileName }}
                </div> -->
                    <span style="font-size: 14px; margin-top: 5px">{{ item.path }}</span>
                    <!-- <div style="margin-left: 20px"></div> -->
                </div>
                <hr />
            </template>
        </div>
        <div id="loading">
            <img src="@img/loading.gif" />
            <!-- <p>로딩 중...</p> -->
        </div>
    </div>
</template>

<script>
const MB = 1024 * 1024;
const MAX_IMGS = 20;
const MAX_FILE_SIZE = 20 * MB;
const IMAGE_EXT_LIST = ['jpg', 'png', 'jpeg', 'gif', 'webp'];
import { ajaxFetchForm } from '@/utils/function.js';

export default {
    // name: 'HelloWorld',
    props: {
        msg: String,
    },
    data() {
        return {
            imageUrl: process.env.VUE_APP_IMG_URL,
            uploadImageArr: [],
            imageFilesList: [],
            warningText: '',
            companyCode: '',
            uploadMessage: '',
            uploadedData: [],
        };
    },
    created() {},
    mounted() {
        /*---------------- 파일 업로드 동작 ------------------------*/

        let imageBlobObj;
        let formImgData = new FormData();

        class ResizeFile {
            constructor(file, imgUrl) {
                this.file = file;
                this.imgUrl = imgUrl;
            }
        }

        let resizeFile;
        // this.imageFilesList = new Array();
        let chkFile = 0; // this.imageFilesList.length 길이가 0일때 0임.

        const fileInput = document.getElementById('upload');
        const fileDragDiv = document.getElementById('upload-wrapper');

        const imageUploadPlate = document.querySelector('.upload-img');
        const imageChildren = document.querySelectorAll('.upload-img-child');

        const removeImgPlateBtn = document.querySelector('#removeImgBtn');
        const removeImgBtnChildren = document.querySelectorAll('.removeImgBtnChild');
        const removeAllBtn = document.getElementById('removeAll');

        const wrapperChildDivs = document.querySelectorAll('#upload-wrapper-child');

        // const MAX_IMG = wrapperChildDivs.length;
        // const MAX_IMG = 20;

        /* 파일 드래그 기능 */
        if (window.File && window.FileList && window.FileReader) {
            init();
            // initImageSelectEvent();
        }

        // initialize
        function init() {
            // is XHR2 available?
            let xhr = new XMLHttpRequest();
            if (xhr.upload) {
                // file drag and drop 방식
                fileDragDiv.addEventListener('dragover', fileDragHover, false);
                fileDragDiv.addEventListener('dragleave', fileDragHover, false);
                fileDragDiv.addEventListener('drop', fileSelectHandler, false);
                fileInput.addEventListener('change', fileInputHandler, false);
            }
        }

        // file drag hover
        // 이건 파일 드래그 하는지 안하는지 구별용.
        function fileDragHover(e) {
            e.stopPropagation();
            e.preventDefault();

            let isHover;

            // 드래그 하는 건지, 마우스를 거기에 걍 갖다대는 건지 구별.
            if (e.type === 'dragover') {
                e.target.setAttribute('isDragover', true);
                isHover = true;
            } else {
                e.target.setAttribute('isDragover', false);
                isHover = false;
            }

            // let isHover = (e.target.className = e.type === 'dragover' ? true : false);
            // let isHover = (e.target.setAttribute('isDragover', ) = e.type === 'dragover' ? true : false);

            // console.log('dragClassName : ' + e.target.className);

            if (isHover) {
                fileDragDiv.style.color = '#f00';
                fileDragDiv.style.borderColor = '#f00';
                fileDragDiv.style.borderStyle = 'solid';
                fileDragDiv.style.boxShadow = 'inset 0 3px 4px #888';
            } else {
                fileDragDiv.style.color = '';
                fileDragDiv.style.borderColor = '';
                fileDragDiv.style.borderStyle = '';
                fileDragDiv.style.boxShadow = '';
            }
        }

        // file selection
        function fileSelectHandler(e) {
            e.preventDefault();
            console.log('fileSelectHandeler');

            // cancel event and hover styling
            fileDragHover(e);

            // 리사이징한 이미지 미리보기
            load_image(e);
        }

        // 파일 input 이벤트 동작
        function fileInputHandler(e) {
            e.preventDefault();
            console.log('inputImage');

            // 리사이징한 이미지 미리보기
            load_image(e);
        }

        /* // 메인 프리뷰 삭제 버튼
        removeImgPlateBtn.addEventListener('click', (e) => {
            e.preventDefault();

            console.log('removePlate');
            let index = imageUploadPlate.getAttribute('alt');

            if (index === null) {
                this.imageFilesList.splice(this.imageFilesList.length - 1, 1);
            } else {
                this.imageFilesList.splice(index, 1);
            }

            settingImg(this.imageFilesList);
            resetWrapper();

            // console.log('remove this.imageFilesList', this.imageFilesList);
        });

        removeImgBtnChildren.forEach((removeChild, index) => {
            removeChild.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('removeImg ' + index);

                if (this.imageFilesList.length - 1 >= index) {
                    this.imageFilesList.splice(index, 1);
                    settingImg(this.imageFilesList);
                    // console.log(this.imageFilesList);
                }
            });
        });*/

        // 전부 제거
        removeAllBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // console.log('removeAll');
            // console.log(fileInput.fils);

            this.imageFilesList = new Array();
            resetImg();
            document.querySelector('#upload').value = null;

            chkFile = 0;
        });

        function initImageSelectEvent() {
            const wrapperChildDivs = document.querySelectorAll('#upload-wrapper-child');

            wrapperChildDivs.forEach((wrapperChild, index) => {
                wrapperChild.addEventListener('click', (e) => {
                    // console.log('!!!!!!!!!!!!!!!!!!!');
                    // console.log('wrapper3 arrlength ', this.imageFilesList);
                    // console.log('wrapper3 arrlength ' + this.imageFilesList.length);

                    e.preventDefault();

                    if (this.imageFilesList.length - 1 >= index) {
                        resetWrapper();

                        // wrapperChild.style.borderColor = 'red';
                        wrapperChild.style.borderWidth = '3px';

                        imageUploadPlate.setAttribute('src', this.imageFilesList[index].imgUrl);
                        imageUploadPlate.setAttribute('alt', index);
                    }

                    if (this.imageFilesList.length == index) {
                        wrapperChildDivs[index].style.borderColor = 'black';
                        wrapperChildDivs[index].style.borderWidth = '1px';
                    }
                });
            });
        }

        // 이미지 구별
        // ps 사실 이거 없어도 됨.
        // loadimg에서 이미지 아닌거 걸러내고 img 파일만 리스트에 넣어줌
        const isImage = (_files) => {
            let _filesArr = Array.prototype.slice.call(_files);
            let chkExt = true;
            // console.log(_filesArr);

            _filesArr.forEach((file) => {
                let fileName = file.name;
                let ext = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();

                if (!IMAGE_EXT_LIST.includes(ext)) {
                    // if (ext !== 'jpg' && ext !== 'png' && ext !== 'jpeg') {
                    console.log('확장자 아님');
                    chkExt = false;
                    return;
                }
            });

            return chkExt;
        };

        // 이미지를 불러옴, 이미지 셋팅
        const load_image = (e) => {
            // 이미지 파일들 넣음
            let files = e.target.files || e.dataTransfer.files;

            if (!isImage(files)) {
                chkFile = 0;
                alert(`이미지 파일 (.${IMAGE_EXT_LIST.join(', .')})만 업로드 가능합니다.`);
            } else {
                chkFile = 1;
                // console.log('files from load_img ' + files);

                // 여러장의 이미지를 불러와 배열화
                const filesArr = Array.prototype.slice.call(files);

                if (filesArr.length > MAX_IMGS - this.imageFilesList.length) {
                    // if (filesArr.length > MAX_IMGS) {
                    alert(`개수 초과 ${MAX_IMGS} 개만 올리세요.`);
                } else {
                    filesArr.forEach((file, i) => {
                        // console.log(i);
                        const reader = new FileReader();

                        if (!this.checkFileSize(file)) {
                            return;
                        }

                        // 비동기
                        reader.onload = (e) => {
                            const image = new Image();
                            image.className = 'img-item'; // 스타일 적용을 위해
                            image.src = e.target.result;

                            // 비동기
                            image.onload = (imageEvent) => {
                                // 이미지가 로드가 되면! 리사이즈 함수가 실행되도록 합니다.
                                // resizeImage(image, file.name, file, e.target.result);
                                setPreviewImg(image, file.name, file, e.target.result);
                            };
                        };
                        reader.readAsDataURL(file);
                    });

                    // TODO : 콜백처리 이게 젤 문제
                    // settingImg(this.imageFilesList);
                    // console.log('this.imageFilesList', this.imageFilesList);
                }
            }
        };

        const resetImg = () => {
            const uploadImg = `${process.env.VUE_APP_BASE_URL}img/upload.svg`;

            imageUploadPlate.setAttribute('src', uploadImg);
            imageUploadPlate.style.opacity = 0.2;
            imageUploadPlate.style.width = '200px';
            imageUploadPlate.style.height = '150px';

            // imageChildren.forEach((imageChild) => {
            //     imageChild.removeAttribute('src');
            //     // imageChild.style.display = 'contents';
            // });
        };

        const resetWrapper = () => {
            for (let i = 0; i < wrapperChildDivs.length; i++) {
                // wrapperChildDivs[i].style.borderColor = 'black';
                wrapperChildDivs[i].style.borderWidth = '1px';
            }
        };

        // 이미지 제거시 이용.
        const settingImg = (resizeFilesArray) => {
            console.log('setting');

            resetImg();

            for (let i = 0; i < resizeFilesArray.length; i++) {
                if (i === resizeFilesArray.length - 1) {
                    imageUploadPlate.setAttribute('src', resizeFilesArray[resizeFilesArray.length - 1].imgUrl);
                    imageUploadPlate.setAttribute('alt', i);
                    imageUploadPlate.style.opacity = 1;
                    imageUploadPlate.style.width = '270px';
                    imageUploadPlate.style.height = '230px';
                    imageUploadPlate.style.height = '250px';
                }

                console.log('i, imageChildren[i]');
                console.log(i, imageChildren[i]);

                imageChildren[i].setAttribute('src', resizeFilesArray[i].imgUrl);
                imageChildren[i].style.display = 'block';
            }
        };

        const resizeImage = (image, fileName, fileObj, imageUrl) => {
            console.log('resize');

            let canvas = document.createElement('canvas');

            let width = 500,
                height = 400;
            /* let imgRatio = imageRatioControl(image);
            console.log(imgRatio); */

            // 그림 그리는 그림을 보여주는 캔버스 크기를 조정. 이미지 크기는 조절 x
            /* canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(image, 0, 0, width, height);

            // 이미지 포맷 설정.
            // const dataUrl = canvas.toDataURL("image/jpeg");
            const dataUrl = canvas.toDataURL(); // 공백시 원래 이미지 포맷 따라감.
            imageBlobObj = dataURLToBlob(dataUrl);

            // 이미지 bolb 객체화
            // console.log(imageBlobObj);
            resizeFile = new ResizeFile(
                new File([imageBlobObj], fileName, {
                    type: imageBlobObj.type,
                }),
                dataUrl
            ); */

            // console.log(fileObj);
            // console.log(imageUrl);

            // 다시 파일로 옮김.
            // this.imageFilesList.push(resizeFile);
            this.imageFilesList.push({
                fileObj: fileObj,
                imgUrl: imageUrl,
            });

            let i = this.imageFilesList.length - 1;

            imageChildren[i].setAttribute('src', this.imageFilesList[i].imgUrl);
            imageChildren[i].style.display = 'block';

            // 메인 이미지 크기 셋팅
            imageUploadPlate.setAttribute('src', this.imageFilesList[i].imgUrl);
            // imageUploadPlate.style.width = '270px';
            // imageUploadPlate.style.height = '230px';
            imageUploadPlate.style.opacity = 1;
            imageUploadPlate.style.width = '100%';
            imageUploadPlate.style.maxWidth = '440px';
            imageUploadPlate.style.height = '100%';
            // imageUploadPlate.style.maxHeight = '300px';
            imageUploadPlate.style.maxHeight = '310px';
        };

        const setPreviewImg = (image, fileName, fileObj, imageUrl) => {
            // console.log(fileObj);
            // console.log(imageUrl);

            // 다시 파일로 옮김.
            // this.imageFilesList.push(resizeFile);
            this.imageFilesList.push({
                fileObj: fileObj,
                imgUrl: imageUrl,
            });

            let i = this.imageFilesList.length - 1;

            // console.log('this.imageFilesList', this.imageFilesList);

            //  주석처리
            /* imageChildren[i].setAttribute('src', this.imageFilesList[i].imgUrl);
            imageChildren[i].style.display = 'block'; */
            // console.log(wrapperChildDivs);

            // 메인 이미지 크기 셋팅
            imageUploadPlate.setAttribute('src', this.imageFilesList[i].imgUrl);
            // imageUploadPlate.style.width = '270px';
            // imageUploadPlate.style.height = '230px';
            // imageUploadPlate.style.maxHeight = '300px';
            imageUploadPlate.style.opacity = 1;
            imageUploadPlate.style.width = '100%';
            imageUploadPlate.style.maxWidth = '440px';
            imageUploadPlate.style.height = '100%';
            imageUploadPlate.style.maxHeight = '310px';
        };

        // 이미지 비율 조정
        let imageRatioControl = (_image) => {
            // 최대 사이즈
            const _max_view_size = 1280;

            let _width = _image.width,
                _height = _image.height;

            if (_width > _height) {
                if (_width > _max_view_size) {
                    _height *= _max_view_size / _width;
                    _width = _max_view_size;
                }
            } else {
                if (_height > _max_view_size) {
                    _width *= _max_view_size / _height;
                    _height = _max_view_size;
                }
            }

            return {
                width: _width,
                height: _height,
            };
        };

        const dataURLToBlob = (dataURL) => {
            const BASE64_MARKER = ';base64,';

            // base64로 인코딩 되어있지 않을 경우
            if (dataURL.indexOf(BASE64_MARKER) === -1) {
                const parts = dataURL.split(',');
                const contentType = parts[0].split(':')[1];
                const raw = parts[1];

                return new Blob([raw], {
                    type: contentType,
                });
            }

            // base64로 인코딩 된 이진데이터일 경우
            const parts = dataURL.split(BASE64_MARKER);
            const contentType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]);

            // atob()는 Base64를 디코딩하는 메서드
            const rawLength = raw.length;

            // 부호 없는 1byte 정수 배열을 생성
            const uInt8Array = new Uint8Array(rawLength); // 길이만 지정된 배열
            let i = 0;
            while (i < rawLength) {
                uInt8Array[i] = raw.charCodeAt(i);
                i++;
            }

            return new Blob([uInt8Array], {
                type: contentType,
            });
        };
    },
    methods: {
        checkFileSize(file) {
            if (MAX_FILE_SIZE * MB < file.size) {
                this.warningText = `${MAX_FILE_SIZE} MB 이하 크기까지 업로드 가능합니다.`;

                return false;
            }

            return true;
        },
        resetWrapper() {
            const wrapperChildDivs = document.querySelectorAll('#upload-wrapper-child');
            //
            for (let i = 0; i < wrapperChildDivs.length; i++) {
                wrapperChildDivs[i].style.borderColor = 'black';
                wrapperChildDivs[i].style.borderWidth = '1px';
            }
            // console.log('AAAAAAAA');
        },
        selectImage(e, index) {
            // console.log('!!!!!!!!!!!!!!!!!!!', e, index);
            // console.log('wrapper3 arrlength ', this.imageFilesList);
            // console.log('wrapper3 arrlength ' + this.imageFilesList.length);

            // const wrapperChild = e.target;
            const wrapperChildDivs = document.querySelectorAll('#upload-wrapper-child');
            const imageUploadPlate = document.querySelector('.upload-img');

            e.preventDefault();

            if (this.imageFilesList.length - 1 >= index) {
                this.resetWrapper();

                // console.log(wrapperChild);

                wrapperChildDivs[index].style.borderColor = 'red';
                wrapperChildDivs[index].style.borderWidth = '3px';

                imageUploadPlate.setAttribute('src', this.imageFilesList[index].imgUrl);
                imageUploadPlate.setAttribute('alt', index);
            }

            if (this.imageFilesList.length == index) {
                wrapperChildDivs[index].style.borderColor = 'black';
                wrapperChildDivs[index].style.borderWidth = '1px';
            }
        },
        removeImage(e, index) {
            e.preventDefault();
            // console.log('removeImg ' + index);

            if (this.imageFilesList.length - 1 >= index) {
                this.imageFilesList.splice(index, 1);
                this.settingImg(this.imageFilesList);
                // console.log(this.imageFilesList);
            }
        },
        removePreviewImage(e) {
            // console.log('removePlate');

            e.preventDefault();
            const imageUploadPlate = document.querySelector('.upload-img');
            let index = imageUploadPlate.getAttribute('alt');

            if (index === null) {
                this.imageFilesList.splice(this.imageFilesList.length - 1, 1);
            } else {
                this.imageFilesList.splice(index, 1);
            }

            this.settingImg(this.imageFilesList);
            this.resetWrapper();

            // console.log('remove this.imageFilesList', this.imageFilesList);
        },
        // 이미지 제거시 이용.
        settingImg(imageList) {
            // console.log('setting');

            const imageUploadPlate = document.querySelector('.upload-img');
            const imageChildren = document.querySelectorAll('.upload-img-child');
            this.resetImg();

            for (let i = 0; i < imageList.length; i++) {
                if (i === imageList.length - 1) {
                    imageUploadPlate.setAttribute('src', imageList[imageList.length - 1].imgUrl);
                    imageUploadPlate.setAttribute('alt', i);

                    this.setPreviewImageCss(imageUploadPlate);
                }

                imageChildren[i].setAttribute('src', imageList[i].imgUrl);
                imageChildren[i].style.display = 'block';
            }
        },
        resetImg() {
            const uploadImg = `${process.env.VUE_APP_BASE_URL}img/upload.svg`;
            const imageUploadPlate = document.querySelector('.upload-img');
            const imageChildren = document.querySelectorAll('.upload-img-child');

            imageUploadPlate.setAttribute('src', uploadImg);
            imageUploadPlate.style.opacity = 0.2;
            imageUploadPlate.style.width = '200px';
            imageUploadPlate.style.height = '150px';

            // imageChildren.forEach((imageChild) => {
            //     imageChild.removeAttribute('src');
            //     // imageChild.style.display = 'contents';
            // });
        },
        setPreviewImageCss(imageUploadPlate) {
            imageUploadPlate.style.opacity = 1;
            imageUploadPlate.style.width = '100%';
            imageUploadPlate.style.maxWidth = '440px';
            imageUploadPlate.style.height = '100%';
            imageUploadPlate.style.maxHeight = '310px';
        },
        async uploadImages() {
            /* 로딩 기능 */

            // console.log(this.imageFilesList);
            // console.log(this.companyCode);
            // console.log(process.env.VUE_APP_BASE_API);
            if (!this.imageFilesList || this.imageFilesList.length < 1) {
                // console.log('AAAAAAAAAAA');
                return;
            }

            if (!this.companyCode || isNaN(this.companyCode)) {
                alert('회사코드는 숫자여야만 합니다.');
                return;
            }

            const data = {
                images: this.imageFilesList,
                options: {
                    path: '/company/' + this.companyCode,
                },
            };

            document.getElementById('loading').style.display = 'block';

            let result = await this.ajaxUploadImages(data);

            document.getElementById('loading').style.display = 'none';

            if (!result.ok) {
                alert('server error');
                return;
            }

            result = await result.json();

            this.uploadedData = result.data;
            this.uploadMessage = result.message;
            // console.log(this.uploadedData);
            // console.log(this.uploadMessage);
        },
        async ajaxUploadImages(data) {
            // console.log(process.env.VUE_APP_BASE_API);
            const apiUrl = process.env.VUE_APP_BASE_API + '/drv/upload/image';

            const { images, options } = data;

            // console.log(options);

            let _formData = new FormData();

            if (!Array.isArray(images)) {
                _formData.append('images', images);
            } else {
                for (let item of images) {
                    if (item) _formData.append('images', item.fileObj);
                }
            }

            // 추가 데이터 추가
            for (let key in options) {
                _formData.append(key, options[key]);
            }

            return ajaxFetchForm(apiUrl, 'POST', _formData);
        },
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.image-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: nowrap;
}

.result-wrap {
    margin-left: 20px;
    border: 1px solid lightgray;
    padding: 20px;
    border-radius: 4px;
    width: 400px;
    overflow: auto;
    max-height: 700px;
}

.result-image-wrap {
    /* width: 300px;
    height: 300px; */
    width: 200px;
    height: 200px;
    /* max-width: 60px; */
    /* max-height: 60px; */
    /* background-size: cover; */
    background-size: contain;
    background-repeat: no-repeat;
    background-color: rgba(0, 0, 0, 0.7);
    background-position: center;
}

label {
    font-size: 18px;
}

label[for='upload'] {
    cursor: pointer;
}

.image-upload {
    /* display: inline-block; */
    display: flex;
    flex-direction: column;
    align-items: center;
}

.main-image_preview {
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
    /* height: 210px; */
    /* height: 240px; */
    height: 300px;
}

.main-remove-btn {
    position: relative;
    float: right;
    /* width: 7px; */
    /* height: 20px; */
    /* left: 26px; */
    top: 10px;
    right: 24px;
    z-index: 99;
    cursor: pointer;
    color: red;
}

.main-remove-btn:hover {
    color: black;
}

.upload-plate {
    display: inline-block;
    padding-left: 12px;
    padding-top: 12px;
}

.upload-table {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start;
    align-content: center;
    /* width: 480px; */
    /* width: 520px; */
    width: 512px;
    margin-top: 20px;
    margin-bottom: 100px;
}

.upload-wrapper-row {
    display: inline-block;
    height: 133px;
}

.upload-wrapper-span {
    padding-right: 6px;
}

#upload-wrapper {
    background-color: rgba(255, 255, 255, 0.664);
    margin: 0 auto;
    display: inline-block;
    border-radius: 8px;
    text-align: center;
    letter-spacing: -0.5;
    padding: 0.5em 1em 0.5em 1em;
    transition: box-shadow 0.5s, background-color 0.5s;
    border: 1px solid black;
    /* width: 320px; */
    /* width: 480px; */
    width: 520px;
    /* height: 320px; */
    height: 380px;
    cursor: pointer;
}

.upload-img {
    width: 200px;
    height: 150px;
    opacity: 0.2;

    /* 그림 올릴시 이미지 크기는 250*230 으로 */
}

.upload-wrapper-child {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-content: center;
    align-items: center;
    /* justify-content: center; */
    /* display: inline-block; */

    background-color: rgba(255, 255, 255, 0.664);
    margin: 0 auto;

    border-radius: 8px;
    text-align: center;
    letter-spacing: -0.5;
    padding: 7px 10px 5px 5px;
    transition: box-shadow 0.5s, background-color 0.5s;
    border: 1px solid black;
    width: 120px;
    height: 120px;
    margin: 4px;
}

.image_preview_chilidren {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    flex-wrap: nowrap;
    margin: auto;
}

.remove-btn-child {
    position: relative;
    right: -48px;
    /* top: -6px; */
    top: 2px;

    float: right;
    width: 17px;
    height: 17px;

    color: white;
    cursor: pointer;
    z-index: 99;
    background-color: rgba(0, 0, 0, 0.7);
    font-size: 12px;
    font-weight: bold;
    border-radius: 50%;
}

.upload-img-child {
    position: relative;
    /* top: -10px; */
    top: -12px;
    max-width: 100px;
    width: 100%;
    max-height: 100px;
    height: 100%;
    border: 0px;
}

.remove-btn-child:hover {
    background-color: rgba(0, 0, 0, 0.5);
    /* background-color: black; */
    /* color: black; */
}

/* 모달 스타일 */
#loading {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* 반투명 배경 */
    z-index: 9999; /* 다른 요소 위에 표시 */
}

#loading img {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* transform: translate(-50%, -50%); */
    /* background-color: #fff; */
    /* padding: 20px;
    border-radius: 5px; */
}
</style>
