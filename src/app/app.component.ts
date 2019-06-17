import { Component, ViewChild } from '@angular/core';
import { Events, MenuController, Nav, Platform } from 'ionic-angular';
// import { SplashScreen } from '@ionic-native/splash-screen';
// import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { SetupPage } from '../pages/setup/setup';
import { UserData } from '../providers/user-data';
import { AdminsetupPage } from '../pages/adminsetup/adminsetup';


import { TranslateService } from '@ngx-translate/core';


import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { getURL } from '../providers/sanitizer/sanitizer';

// import { MenuService } from '../providers/menu.service'

export interface PageInterface {
  title: string;
  name: string;
  component: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
  tabName?: string;
  tabComponent?: any;
}

@Component({
  templateUrl: 'app.template.html'
})
export class ConferenceApp {
  blnLogin: boolean = false;
//  baseResource_Url: string = constants.DREAMFACTORY_INSTANCE_URL + '/api/v2/zcs/_table/';
  public Menu_Array: any[] = [];
  public Menu_Tasks_Array: any[] = [];
  public Menu_Claims_Array: any[] = [];
  public Menu_Dashboard_Array: any[] = [];
  public Menu_Reports_Array: any[] = [];
  public Menu_Settings_Array: any[] = [];

  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageInterface[] = [
    // { title: 'Dashboard', name: 'DashboardPage', component: DashboardPage, icon: 'apps' }
  ];

  claimPages: PageInterface[] = [
    // { title: 'Travel Claim', name: 'TravelclaimPage', component: TravelclaimPage, icon: 'car' },
    // { title: 'Entertainment Claim', name: 'EntertainmentclaimPage', component: EntertainmentclaimPage, icon: 'cafe' },
    // { title: 'Gift Claim', name: 'GiftclaimPage', component: GiftclaimPage, icon: 'basket' },
    // { title: 'Overtime Claim', name: 'OvertimeclaimPage', component: OvertimeclaimPage, icon: 'stopwatch' },
    // { title: 'Printing Claim', name: 'PrintclaimPage', component: PrintclaimPage, icon: 'print' },
    // { title: 'Miscellaneous Claim', name: 'MiscellaneousClaimPage', component: MiscellaneousClaimPage, icon: 'albums' },
    // { title: 'Manage Customer', name: 'CustomerSetupPage', component: CustomerSetupPage, icon: 'man' },
  ];

  loggedInPages: PageInterface[] = [
    // { title: 'My Profile', name: 'AccountPage', component: AccountPage, icon: 'person' },
    // { title: 'Change Password', name: 'ChangePasswordPage', component: ChangePasswordPage, icon: 'unlock' },
    // { title: 'Sign Out', name: 'LoginPage', component: LoginPage, icon: 'log-out', logsOut: true }
  ];

  loggedOutPages: PageInterface[] = [
    { title: 'Login', name: 'LoginPage', component: LoginPage, icon: 'log-in' },
    { title: 'Sign Up', name: 'SignupPage', component: SignupPage, icon: 'person-add' },
    { title: 'Forgot Password', name: 'LoginPage', component: LoginPage, icon: 'key' }
  ];

  reportPages: PageInterface[] = [
    // { title: 'Monthly Claim Report', name: 'MonthlyClaimReportPage', component: MonthlyClaimReportPage, icon: 'ios-paper-outline' },
    // { title: 'Finance Task History', name: 'ClaimhistoryPage', component: ClaimhistoryPage, icon: 'md-list-box' },
    // { title: 'Superior History', name: 'ClaimhistorydetailPage', component: ClaimhistorydetailPage, icon: 'ios-list-box-outline' },
    // { title: 'My Claim History', name: 'UserclaimslistPage', component: UserclaimslistPage, icon: 'ios-clipboard-outline' }
  ];

  setupsPages: PageInterface[] = [
    // { title: 'Manage Customer', name: 'CustomerSetupPage', component: CustomerSetupPage, icon: 'man' },
    // { title: 'Setup', name: 'SetupPage', component: SetupPage, icon: 'settings' },
    // { title: 'Admin Setup', name: 'AdminsetupPage', component: AdminsetupPage, icon: 'cog' }
  ];

  rootPage = 'LoginPage';
  appPages_User: PageInterface[];
  USER_NAME_LABEL: any;
  IMAGE_URL: any;

  //To control Menu-------------------------------
  blnDashboard_loggedInMenu_User: boolean = true;
  blnTasks_loggedInMenu_User: boolean = true;
  blnClaims_loggedInMenu_User: boolean = true;
  blnReport_loggedInMenu_User: boolean = true;
  blnSetup_loggedInMenu_User: boolean = true;
  blnAccount_loggedInMenu_User: boolean = true;
  //----------------------------------------------

  constructor(
    public events: Events,
    public userData: UserData,
    public menu: MenuController,
    public platform: Platform,
    //    public confData: ConferenceData,
    public storage: Storage,
    // statusbar: StatusBar,
    // splashScreen: SplashScreen, 
    public translate: TranslateService, public http: Http
  ) {
    // debugger;
    this.blnLogin = false;
    //this.translateToEnglish();
    // this.translateToMalay();
    // this.translate.setDefaultLang('en'); //Fallback language
    // alert(localStorage.getItem("cs_default_language"));

    platform.ready().then(() => {
      //alert(localStorage.getItem("cs_default_language"));

    });
    this.TranslateLanguage();
    // translate.setDefaultLang('en');
    //    platform.ready().then(() => { statusbar.styleDefault(); splashScreen.hide(); });

    // decide which menu items should be hidden by current login status stored in local storage    
    this.userData.hasLoggedIn().then((hasLoggedIn) => {

      this.enableMenu(hasLoggedIn === true);

    });

    //this.enableMenu(true);
    this.listenToLoginEvents();

    this.userData.logout();
    this.enableMenu(false);

    // this.menu.enable(false, 'loggedInMenu');
    this.menu.enable(false, 'loggedInMenu_User');
  }
  pageName: any;
  openPage(page: PageInterface) {
    // debugger;    
    let params = {};

    if (page.index) {
      params = { tabIndex: page.index };
    }
    this.pageName = page.name;
    if (this.nav.getActiveChildNavs().length && page.index != undefined) {
      this.nav.getActiveChildNavs()[0].select(page.index);
      // Set the root of the nav with params if it's a tab index
    } else {
      console.log(page.name);
      this.nav.setRoot(page.name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`);
      });
    }

    if (page.logsOut === true) {
      // Give the menu time to close before changing to logged out
      this.userData.logout(); this.blnLogin = false;
    }
  }

  // MenuService: MenuService = new MenuService();

  listenToLoginEvents() {
    // this.MenuService.EventListener();
    // debugger;    

    this.events.subscribe('user:login', () => {
      this.enableMenu(true);

    });

    this.events.subscribe('user:signup', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      this.enableMenu(false);
    });
  }

  TranslateLanguage() {
    if (localStorage.getItem("cs_default_language") == 'ms') {
      this.translateToMalay();
      this.translate.setDefaultLang('ms');
    }
    else {
      this.translateToEnglish();
      this.translate.setDefaultLang('en');
    }
  }

  enableMenu(loggedIn: boolean) {
    this.blnDashboard_loggedInMenu_User = false;
    this.blnTasks_loggedInMenu_User = false;
    this.blnClaims_loggedInMenu_User = false;
    this.blnReport_loggedInMenu_User = false;
    this.blnSetup_loggedInMenu_User = false;
    this.blnAccount_loggedInMenu_User = false;

    this.appPages = [];
    this.appPages_User = [];
    this.claimPages = [];
    this.reportPages = [];
    this.setupsPages = [];
    this.loggedInPages = [];

    if (localStorage.getItem("g_USER_GUID") != null) {
      loggedIn = true;
    }
    if (localStorage.length > 0) {
      this.blnLogin = true; this.USER_NAME_LABEL = localStorage.getItem("g_FULLNAME");
      this.IMAGE_URL = localStorage.getItem("g_IMAGE_URL");
      this.TranslateLanguage();

      if (localStorage.getItem("g_USER_GUID") == "sva") {
        this.blnAccount_loggedInMenu_User = true;
        this.blnSetup_loggedInMenu_User = true;

        // this.appPages = [
        //   { title: 'Dashboard', name: 'DashboardPage', component: DashboardPage, icon: 'apps' }
        // ];

        this.loggedInPages = [
          { title: 'Sign Out', name: 'LoginPage', component: LoginPage, icon: 'log-out', logsOut: true }
        ];

        this.setupsPages = [
          { title: 'Setup', name: 'SetupPage', component: SetupPage, icon: 'settings' },
          { title: 'Admin Setup', name: 'AdminsetupPage', component: AdminsetupPage, icon: 'cog' }
        ];

        this.menu.enable(loggedIn, 'loggedInMenu');
        this.menu.enable(!loggedIn, 'loggedOutMenu');
      }
      else {
        //Get all the roles and menus for that particular user.-------------------------------------------------------   
        let url: string;
        this.Menu_Array = [];
        this.Menu_Dashboard_Array = [];
        this.Menu_Tasks_Array = [];
        this.Menu_Claims_Array = [];
        this.Menu_Reports_Array = [];
        this.Menu_Settings_Array = [];
        this.http
          .get(getURL("table", "view_user_multi_role_menu", [`USER_GUID=${localStorage.getItem("g_USER_GUID")}`]))
          .map(res => res.json())
          .subscribe(data => {
            let res = data["resource"];

            if (res.length > 0) {
              for (var item in data["resource"]) {
                //For Dashboard-------------------------------------------
                if (data["resource"][item]["MENU_HEADER"] == "Dashboard") {
                  this.Menu_Dashboard_Array.push({ title: data["resource"][item]["NAME"], name: data["resource"][item]["CODE_PAGE_NAME"], component: data["resource"][item]["CODE_PAGE_NAME"], icon: data["resource"][item]["MENU_ICON"] });
                  this.blnDashboard_loggedInMenu_User = true;
                }

                //For Tasks-------------------------------------------
                if (data["resource"][item]["MENU_HEADER"] == "Tasks") {
                  this.Menu_Tasks_Array.push({ title: data["resource"][item]["NAME"], name: data["resource"][item]["CODE_PAGE_NAME"], component: data["resource"][item]["CODE_PAGE_NAME"], icon: data["resource"][item]["MENU_ICON"] });
                  this.blnTasks_loggedInMenu_User = true;
                }

                //For Claims-------------------------------------------
                if (data["resource"][item]["MENU_HEADER"] == "Claims") {
                  this.Menu_Claims_Array.push({ title: data["resource"][item]["NAME"], name: data["resource"][item]["CODE_PAGE_NAME"], component: data["resource"][item]["CODE_PAGE_NAME"], icon: data["resource"][item]["MENU_ICON"] });
                  this.blnClaims_loggedInMenu_User = true;
                }

                //For Reports-------------------------------------------
                if (data["resource"][item]["MENU_HEADER"] == "Reports") {
                  this.Menu_Reports_Array.push({ title: data["resource"][item]["NAME"], name: data["resource"][item]["CODE_PAGE_NAME"], component: data["resource"][item]["CODE_PAGE_NAME"], icon: data["resource"][item]["MENU_ICON"] });
                  this.blnReport_loggedInMenu_User = true;
                }

                //For Setup-------------------------------------------
                if (data["resource"][item]["MENU_HEADER"] == "Settings") {
                  this.Menu_Settings_Array.push({ title: data["resource"][item]["NAME"], name: data["resource"][item]["CODE_PAGE_NAME"], component: data["resource"][item]["CODE_PAGE_NAME"], icon: data["resource"][item]["MENU_ICON"] });
                  this.blnSetup_loggedInMenu_User = true;
                }

                //For Accounts-----------------------------------------
                if (data["resource"][item]["MENU_HEADER"] == "Account") {
                  if (data["resource"][item]["NAME"] == "Sign Out") {
                    this.Menu_Array.push({ title: data["resource"][item]["NAME"], name: data["resource"][item]["CODE_PAGE_NAME"], component: data["resource"][item]["CODE_PAGE_NAME"], icon: data["resource"][item]["MENU_ICON"], logsOut: true });
                    this.blnAccount_loggedInMenu_User = true;
                  }
                  else {
                    if (localStorage.getItem("Ad_Authenticaton") == "true") {
                      if (data["resource"][item]["NAME"] == "My Profile") {
                        this.Menu_Array.push({ title: data["resource"][item]["NAME"], name: data["resource"][item]["CODE_PAGE_NAME"], component: data["resource"][item]["CODE_PAGE_NAME"], icon: data["resource"][item]["MENU_ICON"] });
                        this.blnAccount_loggedInMenu_User = true;
                      }
                    }
                    else {
                      this.Menu_Array.push({ title: data["resource"][item]["NAME"], name: data["resource"][item]["CODE_PAGE_NAME"], component: data["resource"][item]["CODE_PAGE_NAME"], icon: data["resource"][item]["MENU_ICON"] });
                      this.blnAccount_loggedInMenu_User = true;
                    }
                  }
                }
              }

              //Set all menu header---------------------------------------
              this.appPages = this.Menu_Dashboard_Array;
              this.appPages_User = this.Menu_Tasks_Array;
              this.claimPages = this.Menu_Claims_Array;
              this.reportPages = this.Menu_Reports_Array;
              this.setupsPages = this.Menu_Settings_Array;
              this.loggedInPages = this.Menu_Array;
              //----------------------------------------------------------
              //---------if duplicate records then remove---------------------------------------------------------------------------------------
              this.appPages = this.Menu_Dashboard_Array.filter((thing: any, index: any, self: any) =>
                index === self.findIndex((t: any) => (
                  t.name === thing.name
                ))
              )

              this.appPages_User = this.Menu_Tasks_Array.filter((thing: any, index: any, self: any) =>
                index === self.findIndex((t: any) => (
                  t.name === thing.name
                ))
              )

              this.claimPages = this.Menu_Claims_Array.filter((thing: any, index: any, self: any) =>
                index === self.findIndex((t: any) => (
                  t.name === thing.name
                ))
              )

              this.reportPages = this.Menu_Reports_Array.filter((thing: any, index: any, self: any) =>
                index === self.findIndex((t: any) => (
                  t.name === thing.name
                ))
              )

              this.setupsPages = this.Menu_Settings_Array.filter((thing: any, index: any, self: any) =>
                index === self.findIndex((t: any) => (
                  t.name === thing.name
                ))
              )

              this.loggedInPages = this.Menu_Array.filter((thing: any, index: any, self: any) =>
                index === self.findIndex((t: any) => (
                  t.name === thing.name
                ))
              )

              //---------------------------------------------------------------------------------------------------------------------------
            }
          });

        this.menu.enable(loggedIn, 'loggedInMenu_User');
        this.menu.enable(!loggedIn, 'loggedOutMenu');


        // --------------------------------------------------------------------------------------------------------------------------------- 

      }
    }
    else {
      this.blnLogin = false;
    }
  }

  isActive(page: PageInterface) {
    if ((this.nav.getActive() && this.nav.getActive().name === page.name && this.pageName == page.name) ||
      (this.nav.getActive() && this.nav.getActive().name === page.name && page.name == "DashboardPage")) {
      // alert(page.name);
      return 'primary';
    }
    return null;
  }

  public translateToMalayClicked: boolean = false;
  public translateToEnglishClicked: boolean = true;

  public translateToEnglish() {
    this.translate.use('en');
    this.translateToMalayClicked = !this.translateToMalayClicked;
    this.translateToEnglishClicked = !this.translateToEnglishClicked;
  }

  public translateToMalay() {
    this.translate.use('ms');
    this.translateToEnglishClicked = !this.translateToEnglishClicked;
    this.translateToMalayClicked = !this.translateToMalayClicked;
  }

  GetUser_Role(user_guid: string) {
    return new Promise((resolve) => {
      this.http
        .get(getURL("table", "view_user_role_menu", [`USER_GUID=${user_guid}`]))
        .map(res => res.json())
        .subscribe(data => {
          let roles = data["resource"];
          if (data["resource"].length > 0) {
            resolve(roles[0]["ROLE_NAME"]);
          }
          else {
            resolve("NA");
          }
        });
    });
  }
}