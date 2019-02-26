import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Loading, LoadingController } from 'ionic-angular';
import * as constants from '../../app/config/constants';
import { TranslateService } from '@ngx-translate/core';

import { Http, Headers, RequestOptions } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Services } from '../Services';
import { ClaimRequestDetailModel } from '../../models/claim-request-detail.model';
import { ApiManagerProvider } from '../../providers/api-manager.provider';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-add-toll',
  templateUrl: 'add-toll.html', providers: [Services, DecimalPipe]
})
export class AddTollPage {
  @ViewChild('fileInput') fileInput: ElementRef;

  lastImage: string = null;
  MA_SELECT: any;
  loading: Loading;
  TenantGUID: any;
  paymentTypes: any[]; DetailsForm: FormGroup; ClaimMainGUID: any;
  ClaimMethodGUID: any; ClaimMethodName: any;
  ClaimDetailGuid: any; claimDetailsData: any;
  ImageUploadValidation: boolean = false;
  chooseFile: boolean = false;
  currency = localStorage.getItem("cs_default_currency");


  constructor(public numberPipe: DecimalPipe, fb: FormBuilder, public api: ApiManagerProvider, private loadingCtrl: LoadingController, public translate: TranslateService, public http: Http, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    this.TenantGUID = localStorage.getItem('g_TENANT_GUID');
    this.LoadPayments();
    this.LoadAllowanceDetails();
    this.DetailsForm = fb.group({
      avatar1: null,
      avatar: null
    });

    // this.LoadPayments();
    // this.LoadAllowanceDetails();
  }

  claimAmount: number;
  getCurrency(amount: number) {
    //amount=amount.split(",").join("");
    amount = Number(amount);
    if (amount > 99999) {
      alert('Amount should not exceed RM 99,999.00.')
      this.Amount = null
      this.claimAmount = 0;
    }
    else {
      this.claimAmount = amount;
      this.Amount = this.numberPipe.transform(amount, '1.2-2');
    }
  }

  // getCurrency(amount: number) {
  //   this.Amount = this.numberPipe.transform(amount, '1.2-2');
  // }

  onAllowanceSelect(allowance: any) {
    this.Amount = allowance.ALLOWANCE_AMOUNT;
    this.claimAmount = allowance.ALLOWANCE_AMOUNT;

  }
  CloseAddTollPage() {
    this.viewCtrl.dismiss();
  }
  LoadPayments() {
    this.api.getApiModel('main_payment_type', 'filter=TENANT_GUID=' + this.TenantGUID)
      .subscribe(data => {
        this.paymentTypes = data["resource"];
        // this.PayType=this.paymentTypes.filter(s=>s.NAME==localStorage.getItem("cs_default_payment_type"))[0].PAYMENT_TYPE_GUID;
        let paymentType: any = this.paymentTypes.filter(s => s.NAME == localStorage.getItem("cs_default_payment_type"))[0];
        this.PayType = paymentType.PAYMENT_TYPE_GUID;
        this.onPaySelect(paymentType);
        //    if (paymentType.REQUIRE_ATTACHMENT === 0) {
        //     this.ImageUploadValidation = true;
        //   }
        //   else
        //     this.ImageUploadValidation = false;
      });
  }

  imageOptional: boolean = false;
  onPaySelect(payBy: any) {
    if (payBy.REQUIRE_ATTACHMENT === 0) {
      this.imageOptional = true;
    }
    else
      this.imageOptional = false;
  }

  Save(isMA: boolean) {
    if (isMA) {
      if (this.MA_SELECT === 'NA' || this.MA_SELECT === undefined) {
        alert('Please select meal allowance.')
        return;
      }
      // if (this.Description === undefined) {
      //   alert('Please enter valid description.')
      //   return;
      // }
    }
    else {
      if (this.claimAmount === undefined || this.claimAmount <= 0 || this.claimAmount === null) {
        alert('Please enter valid Amount.')
        return;
      }
    }
    if (this.ClaimDetailGuid === undefined || this.ClaimDetailGuid === null) {
      // alert(imageID)
      let claimReqRef: ClaimRequestDetailModel = new ClaimRequestDetailModel();
      claimReqRef.CLAIM_REQUEST_DETAIL_GUID = UUID.UUID();
      claimReqRef.CLAIM_REQUEST_GUID = this.ClaimMainGUID;
      claimReqRef.CLAIM_METHOD_GUID = this.ClaimMethodGUID;
      claimReqRef.PAYMENT_TYPE_GUID = this.PayType === undefined ? 'f74c3366-0437-51ec-91cc-d3fad23b061c' : this.PayType;
      // 2a543cd5-0177-a1d0-5482-48b52ec2100f
      claimReqRef.AMOUNT = this.claimAmount + '';
      claimReqRef.DESCRIPTION = this.Description;
      claimReqRef.CREATION_TS = this.api.CreateTimestamp();
      claimReqRef.UPDATE_TS = this.api.CreateTimestamp();
      claimReqRef.ATTACHMENT_ID = this.imageGUID;

      this.api.postData('claim_request_detail', claimReqRef.toJson(true)).subscribe((response) => {
        alert('Your ' + this.ClaimMethodName + ' details submitted successfully.')
        this.navCtrl.pop();
      })
    }
    else {
      this.api.getApiModel('claim_request_detail', 'filter=CLAIM_REQUEST_DETAIL_GUID=' + this.ClaimDetailGuid)
        .subscribe(data => {
          this.claimDetailsData = data;
          this.claimDetailsData["resource"][0].PAYMENT_TYPE_GUID = this.PayType === undefined ? 'f74c3366-0437-51ec-91cc-d3fad23b061c' : this.PayType;
          this.claimDetailsData["resource"][0].AMOUNT = this.claimAmount;
          this.claimDetailsData["resource"][0].DESCRIPTION = this.Description;
          this.claimDetailsData["resource"][0].UPDATE_TS = this.api.CreateTimestamp();


          this.claimDetailsData["resource"][0].ATTACHMENT_ID = (this.imageGUID !== undefined || this.imageGUID !== null) ? this.imageGUID : this.claimDetailsData["resource"][0].ATTACHMENT_ID;
          this.api.updateApiModel('claim_request_detail', this.claimDetailsData, false).subscribe(() => alert('Your ' + this.ClaimMethodName + ' details are updated successfully.'))
          this.navCtrl.pop();
        })
    }
  }

  allowanceList: any[];
  LoadAllowanceDetails() {
    this.api.getApiModel('main_allowance').subscribe(res => {
      this.allowanceList = res['resource'];
    })
  }

  isFormEdit: boolean = false;
  ngOnInit(): void {
    // this.ClaimMainGUID = this.navParams.get('MainClaim');
    // this.ClaimMainGUID = localStorage.getItem("g_CR_GUID");
    this.ClaimMainGUID = this.navParams.get("MainClaim");
    this.ClaimMethodGUID = this.navParams.get('ClaimMethod');
    this.ClaimMethodName = this.navParams.get('ClaimMethodName');
    this.ClaimDetailGuid = this.navParams.get('ClaimReqDetailGuid');
    if (this.ClaimDetailGuid !== null && this.ClaimDetailGuid !== undefined)
    // && this.ClaimDetailGuid!==undefined
    { this.GetClaimDetailsByGuid(); this.isFormEdit = true }
  }

  stringToSplit: string = "";
  tempUserSplit1: string = "";
  tempUserSplit2: string = "";
  tempUserSplit3: string = "";
  imageURLEdit: any = null;
  GetClaimDetailsByGuid() {
    this.api.getApiModel('view_claim_details', 'filter=CLAIM_REQUEST_DETAIL_GUID=' + this.ClaimDetailGuid).subscribe(res => {
      this.claimDetailsData = res['resource'];
      this.PayType = this.claimDetailsData[0].PAYMENT_TYPE_GUID;
      this.onPaySelect(this.claimDetailsData[0]);
      if (this.claimDetailsData[0].CLAIM_METHOD === 'MealAllowance') {
        this.LoadAllowanceDetails();
        this.allowanceList.forEach(element => {
          if (element.ALLOWANCE_AMOUNT === this.claimDetailsData[0].AMOUNT) {
            this.MA_SELECT = element.ALLOWANCE_NAME + ' - ' + element.ALLOWANCE_AMOUNT
            console.log(this.MA_SELECT);
          }
        });
      }
      this.Amount = this.numberPipe.transform(this.claimDetailsData[0].AMOUNT, '1.2-2');
      this.claimAmount = this.claimDetailsData[0].AMOUNT;
      if (this.claimDetailsData[0].ATTACHMENT_ID !== null)
        this.imageURLEdit = this.api.getImageUrl(this.claimDetailsData[0].ATTACHMENT_ID);

      // this.imageURLEdit = this.claimDetailsData[0].ATTACHMENT_ID
      // this.ImageUploadValidation=false;
      this.ImageUploadValidation = true;
      //this.chooseFile = false;
      this.Description = this.claimDetailsData[0].DESCRIPTION;
    });
  }


  Amount: any; PayType: any; Description: any;
  //  loading = false;
  uploadFileName: string;
  DetailsType: string;
  CloudFilePath: string;

  isImage: boolean = false;
  onFileChange(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'image/jpeg')
        this.isImage = true;
      else
        this.isImage = false;
      this.DetailsForm.get('avatar').setValue(file);
      this.uploadFileName = file.name;
      reader.onload = () => {
        this.DetailsForm.get('avatar').setValue({
          filename: file.name,
          filetype: file.type,
          value: reader.result.split(',')[1]
        });
      };
    }
    this.chooseFile = true;

  }

  fileName1: string;
  ProfileImage: any;
  newImage: boolean = true;
  private ProfileImageDisplay(e: any, fileChoose: string): void {
    let reader = new FileReader();
    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      this.DetailsForm.get(fileChoose).setValue(file);
      if (fileChoose === 'avatar1')
        this.fileName1 = file.name;

      reader.onload = (event: any) => {
        this.ProfileImage = event.target.result;
      }
      reader.readAsDataURL(e.target.files[0]);
    }
    this.imageGUID = this.uploadFileName;
    this.chooseFile = true;
    this.newImage = false
    this.onFileChange(e);
    this.ImageUploadValidation = true;
    this.saveIm();
  }
  uniqueName: any;
  imageGUID: any

  saveIm() {
    let uploadImage = this.UploadImage();
    uploadImage.then(() => {
      this.imageGUID = this.uniqueName;
      this.chooseFile = false;
    })
  }

  clearFile() {
    this.DetailsForm.get('avatar').setValue(null);
    this.fileInput.nativeElement.value = '';
  }

  UploadImage() {
    // if (this.DetailsType === 'Toll') {
    //   this.CloudFilePath = 'eclaim/toll/'
    // }
    // else if (this.DetailsType === 'Parking') {
    //   this.CloudFilePath = 'eclaim/parking/'
    // }
    this.CloudFilePath = 'eclaim/'
    // this.loading = true;
    this.uniqueName = new Date().toISOString() + this.uploadFileName;
    const queryHeaders = new Headers();
    queryHeaders.append('filename', this.uploadFileName);
    queryHeaders.append('Content-Type', 'multipart/form-data');
    queryHeaders.append('fileKey', 'file');
    queryHeaders.append('chunkedMode', 'false');
    queryHeaders.append('X-Dreamfactory-API-Key', constants.DREAMFACTORY_API_KEY);
    const options = new RequestOptions({ headers: queryHeaders });
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
    });
    this.loading.present();
    return new Promise((resolve) => {
      // this.http.post('http://api.zen.com.my/api/v2/files/' + this.CloudFilePath + this.uploadFileName, this.DetailsForm.get('avatar').value, options)
      this.http.post('http://api.zen.com.my/api/v2/files/' + this.CloudFilePath + this.uniqueName, this.DetailsForm.get('avatar').value, options)
        .map((response) => {
          this.loading.dismissAll()
          return response;
        }).subscribe((response) => {
          resolve(response.json());
        })
    })
  }

  displayImage: any
  CloseDisplayImage() {
    this.displayImage = false;
  }

  imageURL: string;
  // DisplayImage(val: any) {
  //   this.displayImage = true;
  //   this.imageURL = val;
  //   if (val !== null) { 
  //     this.imageURL = this.api.getImageUrl(val); 
  //     this.displayImage = true; 
  //     this.isImage = this.api.isFileImage(val); 
  //   }
  // }

}
