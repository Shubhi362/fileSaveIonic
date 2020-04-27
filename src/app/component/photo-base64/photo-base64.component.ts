import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import * as _ from 'lodash';
import { Plugins, FilesystemDirectory, FilesystemEncoding, Capacitor } from '@capacitor/core';
import {DomSanitizer} from '@angular/platform-browser';
const { Filesystem } = Plugins;
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';



@Component({
  selector: 'app-photo-base64',
  templateUrl: './photo-base64.component.html',
  styleUrls: ['./photo-base64.component.scss'],
})
export class PhotoBase64Component implements OnInit {
  imageError: string;
  imageSucess:string;
    isImageSaved: boolean;
    cardImageBase64: string;
    singleImageBase64:string[]=[];
    fileName:string;
    filePath:string;
    clicked:boolean=false;
    fileType:string;
    
    constructor(private _DomSanitizationService: DomSanitizer,  public storage: Storage, private file:File,private fileOpener: FileOpener ) { }

  ngOnInit() {}
  
  async fileChangeEvent(fileInput: any) {
    this.imageError = null;
    debugger;
    if (fileInput.target.files && fileInput.target.files[0]) {

        const fileName=fileInput.target.files[0].name;
        this.fileType=fileInput.target.files[0].type;
        let filePath: any 
        const reader = new FileReader();
        reader.onload = (e: any) => {
          debugger
          const imgBase64Path = e.target.result;
          this.cardImageBase64 = imgBase64Path;
          console.log(this.cardImageBase64)
          try {
                 const result =  Filesystem.writeFile({
                  path: fileName,
                  data:e.target.result,
                  directory: FilesystemDirectory.Documents,
                  recursive:false
                }).then( path=> 
                    {    
                      debugger                 
                      this.fileName=fileName;
                      this.filePath=path.uri;
                      this.storage.set(this.fileName,{'path':this.filePath,'type':this.fileType})
                      this.isImageSaved=true;
                      this.imageSucess="Files are saved Sucessfully."
                    },err => 
                    {
                      this.isImageSaved=false;
                      this.imageError="unable to save file";
                    }
                  );    
      
                } catch(e) {
                  this.isImageSaved=false;
                  this.imageError=e;
                  this.imageError=e;
                }
        };
        reader.readAsDataURL(fileInput.target.files[0]);
         
        // if(this.fileType.includes('pdf')){
          
        //   var blobUrl=URL.createObjectURL(fileInput.target.files[0]);
        //   window.open(blobUrl)
        // reader.readAsDataURL(fileInput.target.files[0]);
        // }
        // else{
        //   reader.readAsDataURL(fileInput.target.files[0]);
        // }
    }
}

removeImage() {
    this.cardImageBase64 = null;
    this.isImageSaved = false;
    this.storage.remove(this.fileName)
}

allFiles:[{name:string,path:string,type:string}]=[{name:"",path:"",type:""}];

getAllFIles(){
   
  this.allFiles=[{name:"",path:"",type:""}];
 
  this.clicked=true;
  this.storage.forEach((val,key)=>{
      var obj={name:"",path:"",type:""};
      obj.name=key;
      obj.path=val.path;   
      obj.type =val.type;
      this.allFiles.push(obj);
    })
}

clearList(){
  this.allFiles=[{name:"",path:"",type:""}];
  this.clicked=false;
}
getMIMEtype(extn){
  let ext=extn.toLowerCase();
  let MIMETypes={
    'txt' :'text/plain',
    'docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc' : 'application/msword',
    'pdf' : 'application/pdf',
    'jpg' : 'image/jpeg',
    'bmp' : 'image/bmp',
    'png' : 'image/png',
    'xls' : 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'rtf' : 'application/rtf',
    'ppt' : 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
  return MIMETypes[ext];
}

async showFile(obj){
  let file_name=obj.name;
  let filepath =obj.path.replace(obj.name, '');

  let fileExtn=file_name.split('.').reverse()[0];
  let fileMIMEType=this.getMIMEtype(fileExtn);

  this.file.copyFile(filepath,file_name,this.file.dataDirectory, file_name).then(result=>
    {
      this.fileOpener.open(result.nativeURL,fileMIMEType);
    });
          //  this.fileOpener.open(obj.path, fileMIMEType)
          //         .then(() => console.log('File is opened'))
          //         .catch(e => console.log('Error openening file', e));
                 

      // let type=obj.type
      // let path=obj.path;
      // path=path.replace(FilesystemDirectory.Documents,'');
      // debugger;
      // let contents = await Filesystem.readFile({
      //   path: path,
      //   directory: FilesystemDirectory.Documents    
      
      // }).then(res=>{
      //       if(type.includes('image')){
      //           this.singleImageBase64[obj.name]='data:image/jpeg;base64,'+res.data;
      //       }
      //       else if(type.includes('pdf')){
      //         this.b64toBlob(res.data,'application/pdf',512);
      //       }
      //       else{
      //         this.b64toBlob(res.data,type,512);
      //       }
      // // 'data:image/jpeg;base64,'+res.data; 
      // }); 
    }

    // async showpdf(obj){

    //   let contents = await Filesystem.readFile({
    //     path: 'secrets/'+obj.name,
    //     directory: FilesystemDirectory.Documents,
    //   });
    
    //     this.b64toBlob(contents.data,'application/pptx',512);
    // }

    b64toBlob(b64Data, contentType, sliceSize) {
      var contentType = contentType || '';
      var sliceSize = sliceSize || 512;
      var byteCharacters = atob(b64Data);
      var byteArrays = [];
      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          var slice = byteCharacters.slice(offset, offset + sliceSize);
          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
          }
          var byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
      }
      var blob= new Blob(byteArrays, {type: contentType});
      var blobUrl=URL.createObjectURL(blob)
      window.open(blobUrl);
    }
}
