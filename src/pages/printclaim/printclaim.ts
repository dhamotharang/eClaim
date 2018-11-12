import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import * as constants from '../../app/config/constants';
import { PrintingClaim_Service } from '../../services/printingclaim_service';
import { BaseHttpService } from '../../services/base-http';
// import { TravelclaimPage } from '../travel-claim/travel-claim.component';
import { DecimalPipe } from '@angular/common';
import { FileTransfer } from '@ionic-native/file-transfer';

import { LoadingController, ActionSheetController, Loading, ToastController } from 'ionic-angular';
import { ApiManagerProvider } from '../../providers/api-manager.provider';
import { ProfileManagerProvider } from '../../providers/profile-manager.provider';
import { UserclaimslistPage } from '../userclaimslist/userclaimslist';
import moment from 'moment';
import * as Settings from '../../dbSettings/companySettings';

@IonicPage()
@Component({
  selector: 'page-printclaim',
  templateUrl: 'printclaim.html', providers: [PrintingClaim_Service, BaseHttpService, FileTransfer, DecimalPipe]
})
export class PrintclaimPage {

  uploadFileName: string;
  loading: Loading;
  CloudFilePath: string;
  @ViewChild('fileInput') fileInput: ElementRef;

  public MainClaimSaved: boolean = false;
  Printing_Date_ngModel: any = this.apiMng.CreateTimestamp();
  Printing_Description_ngModel: any;
  Printing_Amount_ngModel: any;
  Customer_GUID: any;
  Soc_GUID: any;
  ClaimRequestMain: any;
  isCustomer: boolean = false;
  Printform: FormGroup;
  travelAmount: any;
  validDate = new Date().toISOString();
  claimFor: string = 'seg_project';
  currency = localStorage.getItem("cs_default_currency");

  public Print_SOC_No_ngModel: any;
  public Travel_ProjectName_ngModel: any;
  Project_Lookup_ngModel: any;
  Customer_Lookup_ngModel: any;
  storeProjects: any[];
  customers: any[];
  storeCustomers: any[];
  public projects: any[];
  TenantGUID: any;

  ProjectLookupClicked: boolean = false;
  CustomerLookupClicked: boolean = false;
  public AddLookupClicked: boolean = false;
  public AddToLookupClicked: boolean = false;
  currentItems: any;

  userGUID: any;

  public assignedTo: any;
  public profileLevel: any;
  public stage: any;
  public profileJSON: any;
  ImageUploadValidation: boolean = false;
  chooseFile: boolean = false;
  min_claim_amount: any; min_claim: any;
  max_claim_amount: any; max_claim: any;
  /********FORM EDIT VARIABLES***********/
  isFormEdit: boolean = false;
  claimRequestGUID: any;
  claimRequestData: any;
  rejectedLevel: any;
  claimAmount: number = 0;
  getCurrency(amount: number) {
    amount = Number(amount);
    if (amount > 99999) {
      // alert('Amount should not exceed RM 9,9999.00.')
      // this.Printing_Amount_ngModel = null
      // this.claimAmount = 0;
    }
    else {
      this.claimAmount = amount;
      this.Printing_Amount_ngModel = this.numberPipe.transform(amount, '1.2-2');
    }
  }
  // Lakshman
  // getCurrency(amount: number) {
  //   amount = Number(amount);
  //   let amount_test=this.numberPipe.transform(amount, '1.2-2');
  //   if (amount <this.min_claim_amount || amount>this.max_claim_amount) {
  //     this.Printing_Amount_ngModel = null
  //     this.claimAmount = 0;
  //   } 
  //   else {
  //     this.claimAmount = amount;
  //     this.Printing_Amount_ngModel = this.numberPipe.transform(amount, '1.2-2');
  //   }
  // } 
  // Lakshman


  imageURLEdit: any = null
  GetDataforEdit() {
    this.apiMng.getApiModel('view_customer', 'filter=TENANT_GUID=' + this.TenantGUID)
      .subscribe(data => {
        this.storeCustomers = this.customers = data["resource"];
        this.apiMng.getApiModel('soc_registration', 'filter=TENANT_GUID=' + this.TenantGUID)
          .subscribe(data => {
            this.storeProjects = this.projects = data["resource"];

            this.apiMng.getApiModel('main_claim_request', 'filter=CLAIM_REQUEST_GUID=' + this.claimRequestGUID)
              .subscribe(data => {
                this.claimRequestData = data["resource"];
                // this.imageURLEdit = this.claimRequestData[0].ATTACHMENT_ID;
                if (this.claimRequestData[0].ATTACHMENT_ID !== null)
                  this.imageURLEdit = this.apiMng.getImageUrl(this.claimRequestData[0].ATTACHMENT_ID);
                this.ImageUploadValidation = true;
                this.claimAmount = this.claimRequestData[0].MILEAGE_AMOUNT
                this.Printing_Amount_ngModel = this.numberPipe.transform(this.claimRequestData[0].MILEAGE_AMOUNT, '1.2-2');
                // this.getCurrency(this.claimRequestData[0].MILEAGE_AMOUNT)

                if (this.claimRequestData[0].SOC_GUID === null) {
                  this.claimFor = 'seg_customer'
                  this.isCustomer = true;
                  if (this.storeCustomers != undefined)
                    this.storeCustomers.forEach(element => {
                      if (element.CUSTOMER_GUID === this.claimRequestData[0].CUSTOMER_GUID) {
                        this.Customer_Lookup_ngModel = element.NAME
                        this.Customer_GUID = element.CUSTOMER_GUID
                      }
                    });
                }
                else {
                  this.claimFor = 'seg_project'
                  this.isCustomer = false;
                  if (this.storeCustomers != undefined)
                    this.storeProjects.forEach(element => {
                      if (element.SOC_GUID === this.claimRequestData[0].SOC_GUID) {
                        this.Project_Lookup_ngModel = element.project_name
                        this.Print_SOC_No_ngModel = element.soc
                        this.Soc_GUID = element.SOC_GUID
                      }
                    });
                }
                this.Printing_Date_ngModel = new Date(this.claimRequestData[0].TRAVEL_DATE).toISOString();
                // this.Printing_Amount_ngModel = this.claimRequestData[0].MILEAGE_AMOUNT;
                this.Printing_Description_ngModel = this.claimRequestData[0].DESCRIPTION;
              });
          });
      })
  }

  constructor(public numberPipe: DecimalPipe, private apiMng: ApiManagerProvider, public profileMng: ProfileManagerProvider, public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams, public translate: TranslateService, fb: FormBuilder, public http: Http, public actionSheetCtrl: ActionSheetController, private loadingCtrl: LoadingController, public toastCtrl: ToastController) {
    // Lakshman
    this.min_claim_amount = localStorage.getItem('cs_min_claim_amt');
    this.min_claim = this.numberPipe.transform(this.min_claim_amount, '1.2-2');
    // this.min_claim_amount =null;
    if (this.min_claim_amount == null) {
      this.min_claim_amount = Settings.ClaimAmountConstants.MIN_CLAIM_AMOUNT
    }
    this.max_claim_amount = localStorage.getItem('cs_max_claim_amt');
    this.max_claim = this.numberPipe.transform(this.max_claim_amount, '1.2-2');
    // this.max_claim_amount =null;
    if (this.max_claim_amount == null) {
      this.max_claim_amount = Settings.ClaimAmountConstants.MAX_CLAIM_AMOUNT
    }
    let currency = localStorage.getItem("cs_default_currency");
    // Lakshman
    this.profileMng.CheckSessionOut();
    this.userGUID = localStorage.getItem('g_USER_GUID');
    this.isFormEdit = this.navParams.get('isFormEdit');
    this.claimRequestGUID = this.navParams.get('cr_GUID'); //dynamic
    this.TenantGUID = localStorage.getItem('g_TENANT_GUID');
    if (this.isFormEdit) {
      this.apiMng.getApiModel('view_work_flow_history', 'filter=(CLAIM_REQUEST_GUID=' + this.claimRequestGUID + ')AND(STATUS=Rejected)').subscribe(res => {
        this.claimRequestData = res['resource'];
        if (this.claimRequestData.length > 0) {
          this.rejectedLevel = this.claimRequestData[0]['PROFILE_LEVEL'];
          this.profileMng.initiateLevels(this.rejectedLevel);
        }
        else
          this.profileMng.initiateLevels('1');
        this.GetDataforEdit();
      })


    }

    else {
      this.LoadCustomers();
      this.LoadProjects();
    }
    this.Printform = fb.group({
      avatar1: null,
      claimTypeGUID: '',
      avatar: null,
      soc_no: '',
      travel_date: ['', Validators.required],
      description: ['', Validators.required],
      claim_amount: ['', Validators.required],
      attachment_GUID: ''
    });
  }

  GetSocNo(item: any) {
    this.Print_SOC_No_ngModel = item.soc;
    this.Project_Lookup_ngModel = item.project_name;
    this.Soc_GUID = item.SOC_GUID;
    this.CloseProjectLookup();
  }

  GetCustomer(guid: any, name: any) {
    this.Customer_Lookup_ngModel = name;
    this.Customer_GUID = guid;
    this.CloseCustomerLookup();
  }

  claimForChanged() {
    // console.log(this.claimFor)
    if (this.claimFor == 'seg_customer') this.isCustomer = true;
    else this.isCustomer = false;
  }

  LoadProjects() {
    // this.apiMng.getApiModel('soc_registration', 'filter=TENANT_GUID=' + this.TenantGUID)

    // Added by Bijay on 25/09/2018
    this.apiMng.getApiModel('soc_registration', 'filter=(TENANT_GUID=' + this.TenantGUID + ')AND(ACTIVATION_FLAG=1)')
      .subscribe(data => {
        this.storeProjects = this.projects = data["resource"];
      })
  }

  LoadCustomers() {
    // this.apiMng.getApiModel('view_customer', 'filter=TENANT_GUID=' + this.TenantGUID)

    // Added by Bijay on 25/09/2018
    this.apiMng.getApiModel('view_customer', 'filter=(TENANT_GUID=' + this.TenantGUID + ')AND(ACTIVE_FLAG=A)')
      .subscribe(data => {
        this.storeCustomers = this.customers = data["resource"];
      })
  }

  public CloseProjectLookup() {
    if (this.ProjectLookupClicked == true) {
      this.ProjectLookupClicked = false;
    }
  }

  public CloseCustomerLookup() {
    if (this.CustomerLookupClicked == true) {
      this.CustomerLookupClicked = false;
    }
  }

  public AddLookupClick() {
    this.AddLookupClicked = true;
    this.currentItems = null;
  }

  public AddToLookupClick() {
    this.AddLookupClicked = true;
    this.AddToLookupClicked = true;
    this.currentItems = null;
  }

  public ProjectLookup() {
    this.ProjectLookupClicked = true;
  }

  public CustomerLookup() {
    this.CustomerLookupClicked = true;
  }

  searchCustomer(searchString: any) {
    let val = searchString.target.value;
    if (!val || !val.trim()) {
      this.customers = this.storeCustomers;
      return;
    }
    this.customers = this.filterCustomer({
      NAME: val
    });
  }

  filterCustomer(params?: any) {
    if (!params) {
      return this.storeCustomers;
    }

    return this.customers.filter((item) => {
      for (let key in params) {
        let field = item[key];
        if (typeof field == 'string' && field.toLowerCase().indexOf(params[key].toLowerCase()) >= 0) {
          return item;
        } else if (field == params[key]) {
          return item;
        }
      }
      return null;
    });
  }

  searchProject(searchString: any) {
    let val = searchString.target.value;
    if (!val || !val.trim()) {
      this.projects = this.storeProjects;
      return;
    }
    this.projects = this.filterProjects({
      project_name: val
    });
  }

  filterProjects(params?: any) {
    if (!params) {
      return this.storeProjects;
    }

    return this.projects.filter((item) => {
      for (let key in params) {
        let field = item[key];
        if (typeof field == 'string' && field.toLowerCase().indexOf(params[key].toLowerCase()) >= 0) {
          return item;
        } else if (field == params[key]) {
          return item;
        }
      }
      return null;
    });
  }

  isImage: boolean = false;
  onFileChange(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'image/jpeg')
        this.isImage = true;
      else
        this.isImage = false;
      this.Printform.get('avatar').setValue(file);
      this.uploadFileName = file.name;
      reader.onload = () => {
        this.Printform.get('avatar').setValue({
          filename: file.name,
          filetype: file.type,
          value: reader.result.split(',')[1]
        });
      };
    }
    //this.chooseFile = true;
  }

  uniqueName: any;
  fileName1: string;
  ProfileImage: any;
  newImage: boolean = true;
  private ProfileImageDisplay(e: any, fileChoose: string): void {
    let reader = new FileReader();
    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      this.Printform.get(fileChoose).setValue(file);
      if (fileChoose === 'avatar1')
        this.fileName1 = file.name;

      reader.onload = (event: any) => {
        this.ProfileImage = event.target.result;
      }
      reader.readAsDataURL(e.target.files[0]);
    }
    this.imageGUID = this.uploadFileName;
    this.chooseFile = true;
    this.ImageUploadValidation = false;
    this.newImage = false;
    this.onFileChange(e);
    this.saveIm();
  }


  imageGUID: any;
  saveIm() {
    let uploadImage = this.UploadImage();
    uploadImage.then(() => {
      //this.submitAction(this.uploadFileName, formValues);
      this.imageGUID = this.uniqueName;
      this.chooseFile = false;
      this.ImageUploadValidation = true;
    })
  }

  UploadImage() {
    this.CloudFilePath = 'eclaim/'
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
      this.http.post('http://api.zen.com.my/api/v2/files/' + this.CloudFilePath + this.uniqueName, this.Printform.get('avatar').value, options)
        .map((response) => {
          this.loading.dismissAll()
          return response;
        }).subscribe((response) => {
          resolve(response.json());
        })
    })
  }

  submitAction(formValues: any) {

    let x = this.Printing_Amount_ngModel.split(",").join("");
    let amount = Number(x);
    if (amount < this.min_claim_amount || amount > this.max_claim_amount) {
      this.Printing_Amount_ngModel = null;
      alert("Claim amount should be " + this.currency + " " + this.min_claim_amount + " - " + this.max_claim_amount + " ");
      return;
    }
    else {
      this.Printing_Amount_ngModel = this.Printing_Amount_ngModel;
    }

    if (this.Customer_GUID === undefined && this.Soc_GUID === undefined) {
      alert('Please select "project" or "customer" to continue.');
      return;
    }
    this.apiMng.getApiModel('claim_work_flow_history', 'filter=(CLAIM_REQUEST_GUID=' + this.claimRequestGUID + ')AND(STATUS="Rejected")')
      .subscribe(data => {
        if (data["resource"].length <= 0)
          if (this.apiMng.isClaimExpired(formValues.travel_date, true)) { return; }

        if (this.isFormEdit) {
          this.apiMng.getApiModel('main_claim_request', 'filter=CLAIM_REQUEST_GUID=' + this.claimRequestGUID)
            .subscribe(data => {
              this.claimRequestData = data;
              this.claimRequestData["resource"][0].ATTACHMENT_ID = this.imageGUID;
              this.claimRequestData["resource"][0].CLAIM_AMOUNT = this.claimAmount;
              this.claimRequestData["resource"][0].MILEAGE_AMOUNT = this.claimAmount;
              this.claimRequestData["resource"][0].TRAVEL_DATE = formValues.travel_date;
              this.claimRequestData["resource"][0].DESCRIPTION = formValues.description;
              if (this.claimRequestData["resource"][0].STATUS === 'Rejected') {
                this.claimRequestData["resource"][0].PROFILE_LEVEL = this.rejectedLevel;
                this.claimRequestData["resource"][0].STAGE = localStorage.getItem('edit_stage');
                this.claimRequestData["resource"][0].ASSIGNED_TO = localStorage.getItem('edit_superior');
                if (this.rejectedLevel === 3)
                  this.claimRequestData["resource"][0].STATUS = 'Approved';
                else
                  this.claimRequestData["resource"][0].STATUS = 'Pending';
              }

              //this.claimRequestData[0].claim_amount= formValues.claim_amount;
              if (this.isCustomer) {
                // this.claimRequestData["resource"][0].CUSTOMER_GUID = formValues.soc_no;
                this.claimRequestData["resource"][0].CUSTOMER_GUID = this.Customer_GUID;
                this.claimRequestData["resource"][0].SOC_GUID = null;
              }
              else {
                // this.claimRequestData["resource"][0].SOC_GUID = formValues.soc_no;
                this.claimRequestData["resource"][0].SOC_GUID = this.Soc_GUID;
                this.claimRequestData["resource"][0].CUSTOMER_GUID = null;
              }

              //Added by Bijay on 12/10/2018 for audit_trial-----------------------
              if (this.claimRequestData["resource"][0].AUDIT_TRAIL != null && this.claimRequestData["resource"][0].AUDIT_TRAIL != "") {
                this.claimRequestData["resource"][0].AUDIT_TRAIL = this.claimRequestData["resource"][0].AUDIT_TRAIL + " \n Edited by " + localStorage.getItem("g_FULLNAME") + " at " + this.apiMng.CreateTimestamp() + "(USER_GUID: " + localStorage.getItem("g_USER_GUID") + ")" + " User From:W";
              }
              else {
                this.claimRequestData["resource"][0].AUDIT_TRAIL = "Edited by " + localStorage.getItem("g_FULLNAME") + " at " + this.apiMng.CreateTimestamp() + "(USER_GUID: " + localStorage.getItem("g_USER_GUID") + ")" + " User From:W";
              }
              //-------------------------------------------------------------------

              //this.claimRequestData[0].STATUS = 'Pending';
              // this.apiMng.updateMyClaimRequest(this.claimRequestData[0]).subscribe(res => alert('Claim details are submitted successfully.'))
              let month = new Date(formValues.travel_date).getMonth() + 1;
              let year = new Date(formValues.travel_date).getFullYear();
              this.apiMng.getApiModel('main_claim_ref', 'filter=(USER_GUID=' + this.userGUID + ')AND(MONTH=' + month + ')AND(YEAR=' + year + ')')
                .subscribe(claimRefdata => {
                  this.claimRequestData["resource"][0].CLAIM_REF_GUID = claimRefdata["resource"][0].CLAIM_REF_GUID;
                  this.apiMng.updateApiModel('main_claim_request', this.claimRequestData, true).subscribe(res => {
                    alert('Claim details updated successfully.')
                    this.navCtrl.push(UserclaimslistPage);
                  });
                })
              // this.apiMng.updateApiModel('main_claim_request', this.claimRequestData, true).subscribe(() => {
              //   //Send Email------------------------------------------------
              //   let start_DT: string = "";
              //   let end_DT: string = "";
              //   // this.apiMng.sendEmail(this.claimRequestData["resource"][0].CLAIM_TYPE_GUID, start_DT, end_DT, this.claimRequestData["resource"][0].CREATION_TS, formValues.travel_date, this.claimRequestGUID);
              //   //Commented By bijay on 24/09/2018 as per scheduler implemented
              //   // this.apiMng.sendEmail_New(this.claimRequestData["resource"][0].CLAIM_TYPE_GUID, "", "", moment(this.claimRequestData["resource"][0].CREATION_TS).format('YYYY-MM-DDTHH:mm'), formValues.travel_date, this.claimRequestGUID, "", "", formValues.description, this.Soc_GUID, this.Customer_GUID);
              //   //----------------------------------------------------------
              //   alert('Claim details updated successfully.');
              //   this.navCtrl.push(UserclaimslistPage);
              // });
            })
        }
        else {
          formValues.claimTypeGUID = 'd9567482-033a-6d92-3246-f33043155746';
          formValues.attachment_GUID = this.imageGUID;
          this.travelAmount = this.claimAmount;
          formValues.soc_no = this.isCustomer ? this.Customer_GUID : this.Soc_GUID;
          this.profileMng.save(formValues, this.travelAmount, this.isCustomer)

        }
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
  //     this.imageURL = this.apiMng.getImageUrl(val); 
  //     this.displayImage = true; 
  //     this.isImage = this.apiMng.isFileImage(val); 
  //   }
  // }
}
//}
