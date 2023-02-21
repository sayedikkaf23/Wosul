import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DEFAULT_CURRENCY_CODE, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MetismenuAngularModule } from '@metismenu/angular';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {
  LocationStrategy,
  //   HashLocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { Router_id } from './views/routing_hidden_id';

import { ChartsModule } from 'ng2-charts';
import { ImageCropperModule } from 'ngx-img-cropper';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ROUTES } from './app.routes';
import { AppComponent } from './app.component';

import { Data } from './views/data';
import { MassNotificationModule } from './views/admin/mass_notification/mass_notification.module';

// App views
import { admin_LoginModule } from './views/admin/admin_login/admin_login.module';
import { AdminProductsModule } from './views/admin/store_products/products.module';

import { AdminForgotPasswordModule } from './views/admin/admin_forgot_password/admin_forgot_password.module';
import { UserNewPasswordModule } from './views/admin/user_new_password/user_new_password.module';
import { ProviderNewPasswordModule } from './views/admin/provider_new_password/provider_new_password.module';
import { AdminNewPasswordModule } from './views/admin/admin_new_password/admin_new_password.module';

import { PaymentGatewayModule } from './views/admin/payment_gateway/payment_gateway.module';

import { AdminstoreSettingModule } from './views/admin/store_setting/setting.module';

import { SettingModule } from './views/admin/setting/setting.module';
import { HistoryModule } from './views/admin/history/history.module';
import { EditProviderVehicleModule } from './views/admin/edit_provider_vehicle/edit_provider_vehicle.module';

import { WalletRequestModule } from './views/admin/wallet_request/wallet_request.module';

import { ProviderVehicleModule } from './views/admin/provider_vehicle/provider_vehicle.module';
import { VehicleDocumentModule } from './views/admin/vehicle_document/vehicle_document.module';

import { DeliveriesModule } from './views/admin/deliveries/deliveries.module';
import { ViewHistoryModule } from './views/admin/view_history/view_history.module';

import { WalletRequestBankDetailModule } from './views/admin/wallet_request_bank_detail/wallet_request_bank_detail.module';

import { ViewProviderHistoryModule } from './views/admin/view_provider_history/view_provider_history.module';

import { ViewInvoiceModule } from './views/admin/view_invoice/view_invoice.module';
import { ViewServiceDetailModule } from './views/admin/view_service_detail/view_service_detail.module';
import { AdminViewCartModule } from './views/admin/admin_view_cart/admin_view_cart.module';
import { AddDetailModule } from './views/admin/add_detail/add_detail.module';

import { CountryModule } from './views/admin/country/country.module';
import { AdminModule } from './views/admin/admin/admin.module';
import { DatabaseBackupModule } from './views/admin/database_backup/database_backup.module';
import { AddAdminModule } from './views/admin/add_admin/add_admin.module';
import { ProviderModule } from './views/admin/provider/provider.module';
import { DashboardModule } from './views/admin/dashboard/dashboard.module';

import { CancellationReasonModule } from './views/admin/cancellation_reason/cancellation_reason.module';

import { LocationTrackModule } from './views/admin/location_track/location_track.module';

import { UploadDocumentModule } from './views/admin/upload_document/upload_document.module';

import { EarningModule } from './views/admin/earning/earning.module';
import { TransLanguageModule } from './views/admin/trans_language/trans_language.module';

import { ProviderMapModule } from './views/admin/provider_map/provider_map.module';
import { StoreMapModule } from './views/admin/store_map/store_map.module';
import { StoreSelectRegionModule } from './views/admin/store_select_region/store_select_region.module';
import { ProviderWeeklyEarningModule } from './views/admin/provider_weekly_earning/provider_weekly_earning.module';
import { StoreWeeklyEarningModule } from './views/admin/store_weekly_earning/store_weekly_earning.module';
import { AdvertiseModule } from './views/admin/advertise/advertise.module';

import { OrderEarningModule } from './views/admin/order_earning/order_earning.module';

import { ViewDocumentModule } from './views/admin/view_document/view_document.module';

import { RequestCancelReasonModule } from './views/admin/request_cancel_reason/request_cancel_reason.module';

import { UserModule } from './views/admin/user/user.module';
import { OrderModule } from './views/admin/order/order.module';
import { ViewBankDetailModule } from './views/admin/view_bank_detail/view_bank_detail.module';

import { AddAdvertiseModule } from './views/admin/add_advertise/add_advertise.module';

import { WalletHistoryModule } from './views/admin/wallet_history/wallet_history.module';
import { ReviewModule } from './views/admin/review/review.module';
import { ViewReviewDetailModule } from './views/admin/view_review_detail/view_review_detail.module';
import { ViewReferralDetailModule } from './views/admin/view_referral_detail/view_referral_detail.module';

import { SmsModule } from './views/admin/sms/sms.module';
import { EmailModule } from './views/admin/email/email.module';

import { AddDocumentModule } from './views/admin/add_document/add_document.module';
import { DocumentModule } from './views/admin/document/document.module';
import { PromoCodeModule } from './views/admin/promo_code/promo_code.module';
import { AddPromoCodeModule } from './views/admin/add_promo_code/add_promo_code.module';

import { ViewPromoUsesModule } from './views/admin/view_promo_uses/view_promo_uses.module';

import { StoresModule } from './views/admin/stores/stores.module';

import { AddCountryModule } from './views/admin/add_country/add_country.module';
import { CityModule } from './views/admin/city/city.module';
import { AddCityModule } from './views/admin/add_city/add_city.module';
import { DeliveryModule } from './views/admin/delivery/delivery.module';
import { AddDeliveryModule } from './views/admin/add_delivery/add_delivery.module';
import { VehicleModule } from './views/admin/vehicle/vehicle.module';
import { AddVehicleModule } from './views/admin/add_vehicle/add_vehicle.module';

import { ServiceModule } from './views/admin/service/service.module';
import { AddServiceModule } from './views/admin/add_service/add_service.module';

import { BasicSettingModule } from './views/admin/basic_setting/basic_setting.module';
import { InstallationSettingModule } from './views/admin/installation_setting/installation_setting.module';
import { OtherSettingModule } from './views/admin/other_setting/other_setting.module';
import { GoogleKeySettingModule } from './views/admin/google_key_setting/google_key_setting.module';
import { AppUpdateSettingModule } from './views/admin/app_update_setting/app_update_setting.module';
import { IosPushNotificationSettingModule } from './views/admin/ios_push_notification_setting/ios_push_notification_setting.module';
import { AppSettingModule } from './views/admin/app_setting/app_setting.module';

import { ImageSettingModule } from './views/admin/image_setting/image_setting.module';
import { OutOfStockItemsModule } from './views/admin/outofstock_items/outofstock_items.module';
import { HiddenItemsModule } from './views/admin/hidden_items/hidden_items.module';
import { ReportItemsModule } from './views/admin/report_items/report_items.module';

import { store_LoginModule } from './views/store/store_login/store_login.module';
import { store_RegisterModule } from './views/store/store_register/store_register.module';
import { StoreForgotPasswordModule } from './views/store/store_forgot_password/store_forgot_password.module';
import { StoreLogoutModule } from './views/store/store_logout/store_logout.module';
import { StoreNewPasswordModule } from './views/store/store_new_password/store_new_password.module';

import { ProfileModule } from './views/store/profile/profile.module';
import { ProductsModule } from './views/store/products/products.module';

import { CategoryModule } from './views/store/category/category.module'; //////////////////////
import { AddcategoryModule } from './views/store/add_category/add_category.module'; //////////////////////

import { EditProductModule } from './views/store/edit_product/edit_product.module';
import { SpecificationModule } from './views/store/specification/specification.module';
import { ItemModule } from './views/store/item/item.module';
import { AddItemModule } from './views/store/add_item/add_item.module';
import { EditItemModule } from './views/store/edit_item/edit_item.module';
import { StoreOrderModule } from './views/store/order/order.module';
import { StoreDeliveryModule } from './views/store/delivery/delivery.module';
import { StoreHistoryModule } from './views/store/history/history.module';
import { StoreUploadDocumentModule } from './views/store/upload_document/upload_document.module';
import { storeSettingModule } from './views/store/setting/setting.module';
import { StoreViewOrderDetailModule } from './views/store/view_order_detail/view_order_detail.module';
import { StoreViewOrderModule } from './views/store/view_order/view_order.module';
import { StoreViewOrderActivityModule } from './views/store/view_order_activity/view_order_activity.module';
import { StoreTrackDeliveryManModule } from './views/store/track_delivery_man/track_delivery_man.module';
import { StoreEditOrderModule } from './views/store/edit_order/edit_order.module';
import { StoreEarningModule } from './views/store/earning/earning.module';
import { StoreDailyEarningModule } from './views/store/daily_earning/daily_earning.module';
import { StorWeeklyEarningModule } from './views/store/weekly_earning/weekly_earning.module';
import { StoreViewCartModule } from './views/store/view_cart/view_cart.module';
import { StoreAddPromoCodeModule } from './views/store/add_promo_code/add_promo_code.module';
import { StorePromoCodeModule } from './views/store/promo_code/promo_code.module';
import { OrderEarningDetailModule } from './views/store/order_earning_detail/order_earning_detail.module';
// App modules/components
import { AdminLayoutsModule } from './common/admin/layouts/admin_layouts.module';
import { StoreLayoutsModule } from './common/store/layouts/store_layouts.module';
import { toreCreateOrderWithoutItemOrderModule } from './views/store/create_order_without_item/create_order_without_item.module';
import { ToastrModule } from 'ngx-toastr';

import { StoreCreateOrderModule } from './views/store/store_create_order/store_create_order.module';
import { StoreCheckoutOrderModule } from './views/store/checkout_order/checkout_order.module';
import { StoreCart } from './views/store/cart';

//franchises
import { franchise_LoginModule } from './views/franchise/franchise_login/franchise_login.module';
import { franchise_RegisterModule } from './views/franchise/franchise_register/franchise_register.module';
import { FranchiseForgotPasswordModule } from './views/franchise/franchise_forgot_password/franchise_forgot_password.module';
import { FranchiseLogoutModule } from './views/franchise/franchise_logout/franchise_logout.module';
import { FranchiseNewPasswordModule } from './views/franchise/franchise_new_password/franchise_new_password.module';
import { FranchisesModule } from './views/admin/franchises/franchises.module';
import { FranchiseProfileModule } from './views/franchise/profile/profile.module';
import { FranchiseProductsModule } from './views/franchise/products/products.module';
import { FranchiseLayoutsModule } from './common/franchise/layouts/franchise_layouts.module';
import { FranchiseStoresModule } from './views/franchise/stores/stores.module';
import { EditFranchiseStoreModule } from './views/franchise/edit_store/edit_store.module';
import { AddFranchiseStoreModule } from './views/franchise/add_store/add_store.module';
import { EditFranchiseProductModule } from './views/franchise/edit_product/edit_product.module';
import { FranchiseSpecificationModule } from './views/franchise/specification/specification.module';
import { FranchiseItemModule } from './views/franchise/item/item.module';
import { FranchiseStoreItemModule } from './views/franchise/store_item/store_item.module';
import { ViewFranchiseStoreDetailModule } from './views/franchise/view_store_detail/view_store_detail.module';
import { AddFranchiseItemModule } from './views/franchise/add_item/add_item.module';
import { EditFranchiseItemModule } from './views/franchise/edit_item/edit_item.module';
import { FranchiseStoreOrderModule } from './views/franchise/order/order.module';
import { FranchiseStoreHistoryModule } from './views/franchise/history/history.module';
import { FranchiseStoreDeliveryModule } from './views/franchise/delivery/delivery.module';
import { FranchiseStoreViewOrderModule } from './views/franchise/view_order/view_order.module';
import { FranchiseStoreViewCartModule } from './views/franchise/view_cart/view_cart.module';
import { FranchiseOrderEarningDetailModule } from './views/franchise/order_earning_detail/order_earning_detail.module';
import { FranchiseStoreTrackDeliveryManModule } from './views/franchise/track_delivery_man/track_delivery_man.module';
import { AllCityModule } from './views/admin/all-city/all-city.module';
import { StoreOrderModules } from './views/store/order_new/order.module';
import { TransactionHistoryModule } from './views/admin/transaction_history/transaction_history.module';
import { ImportDataModule } from './views/store/import-data/import-data.module';
import { StoreProviderModule } from './views/store/provider/provider.module';
import { StoreServiceModule } from './views/store/service/service.module';
import { StoreAddServiceModule } from './views/store/add_service/add_service.module';
import { NotificationSettingsModule } from './views/admin/notification-settings/notification-settings.module';
import { Helper } from './views/helper';
import { CommonInfoModalComponent } from './modals/common-info-modal/common-info-modal.component';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MomentModule } from 'ngx-moment';
import { GroupNotificationModule } from './views/admin/group-notification/group-notification.module';
import { AddTagsModule } from './views/admin/add-tags/add-tags.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SocketService } from './services/socket.service';
import { FtpServerComponent } from './views/admin/ftp_server/ftp_server.component';
import { TokenInterceptor } from './services/token.interceptor';
import { CreateOrderComponent } from './stores-v2/create-order/create-order.component';
import { StoreLayoutComponent } from './stores-v2/store-layout/store-layout.component';
import { StoreOrderListComponent } from './stores-v2/store-order-list/store-order-list.component';
import { AdminLayoutComponent } from './admin-v2/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-v2/admin-dashboard/admin-dashboard.component';
import { AdminOrderComponent } from './admin-v2/admin-order/admin-order.component';


@NgModule({
  declarations: [
    AppComponent,
    CommonInfoModalComponent,
    FtpServerComponent,
    CreateOrderComponent,
    StoreLayoutComponent,
    StoreOrderListComponent,
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminOrderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    UiSwitchModule.forRoot({
      size: 'small',
      color: 'rgb(34, 34, 34)',
      defaultBgColor: 'rgb(231, 98, 98)',
    }),
    ToastrModule.forRoot(),
    ChartsModule,
    TransactionHistoryModule,
    MetismenuAngularModule,
    AddDetailModule,
    LocationTrackModule,
    AdminProductsModule,
    ProviderVehicleModule,
    VehicleDocumentModule,
    RequestCancelReasonModule,
    MassNotificationModule,
    NotificationSettingsModule,
    GroupNotificationModule,
    // Views
    AdvertiseModule,
    admin_LoginModule,
    AdminstoreSettingModule,
    AdminForgotPasswordModule,
    AdminModule,
    DatabaseBackupModule,
    AddAdminModule,
    AddAdvertiseModule,
    SettingModule,
    HistoryModule,
    ViewHistoryModule,
    ViewProviderHistoryModule,
    DeliveriesModule,
    AdminViewCartModule,
    OrderModule,
    CountryModule,
    ProviderModule,
    ViewBankDetailModule,
    UploadDocumentModule,
    AdminNewPasswordModule,
    EditProviderVehicleModule,
    TransLanguageModule,
    ProviderWeeklyEarningModule,
    StoreWeeklyEarningModule,
    WalletRequestBankDetailModule,
    AllCityModule,

    ViewDocumentModule,

    ViewInvoiceModule,
    ProviderMapModule,
    UserNewPasswordModule,
    ProviderNewPasswordModule,
    StoreMapModule,
    CancellationReasonModule,
    OutOfStockItemsModule,
    HiddenItemsModule,
    ReportItemsModule,

    // frenchaise
    franchise_LoginModule,
    franchise_RegisterModule,
    FranchiseForgotPasswordModule,
    FranchiseNewPasswordModule,
    FranchiseLogoutModule,
    FranchisesModule,
    FranchiseProfileModule,
    FranchiseProductsModule,
    FranchiseLayoutsModule,
    FranchiseStoresModule,
    EditFranchiseStoreModule,
    AddFranchiseStoreModule,
    EditFranchiseProductModule,
    FranchiseSpecificationModule,
    FranchiseItemModule,
    FranchiseStoreItemModule,
    AddFranchiseItemModule,
    EditFranchiseItemModule,
    FranchiseStoreOrderModule,
    FranchiseStoreHistoryModule,
    FranchiseStoreDeliveryModule,
    FranchiseStoreViewOrderModule,
    FranchiseStoreViewCartModule,
    FranchiseOrderEarningDetailModule,
    FranchiseStoreTrackDeliveryManModule,
    ViewFranchiseStoreDetailModule,

    SmsModule,
    EmailModule,
    OrderEarningModule,
    EarningModule,

    UserModule,
    DashboardModule,
    WalletHistoryModule,
    WalletRequestModule,
    ReviewModule,
    ViewReviewDetailModule,
    ViewReferralDetailModule,
    StoresModule,
    AddCountryModule,
    CityModule,
    AddCityModule,
    DocumentModule,
    AddDocumentModule,
    PromoCodeModule,
    AddPromoCodeModule,
    ViewPromoUsesModule,
    DeliveryModule,
    AddDeliveryModule,
    VehicleModule,
    AddVehicleModule,
    AddTagsModule,
    ServiceModule,
    AddServiceModule,
    ViewServiceDetailModule,
    // HistoryCalenderModule,
    ImportDataModule,
    StoreProviderModule,

    BasicSettingModule,
    InstallationSettingModule,
    OtherSettingModule,
    GoogleKeySettingModule,
    AppUpdateSettingModule,
    IosPushNotificationSettingModule,
    AppSettingModule,
    ImageSettingModule,

    PaymentGatewayModule,

    //// store views
    store_LoginModule,
    toreCreateOrderWithoutItemOrderModule,
    store_RegisterModule,
    StoreForgotPasswordModule,
    StoreNewPasswordModule,
    StoreLogoutModule,
    StoreEarningModule,
    StoreDailyEarningModule,
    StorWeeklyEarningModule,
    StoreAddPromoCodeModule,
    StorePromoCodeModule,
    StoreEditOrderModule,
    StoreOrderModules,
    StoreServiceModule,
    StoreAddServiceModule,
    StoreSelectRegionModule,

    ProfileModule,
    ProductsModule,
    CategoryModule, ///////////////
    AddcategoryModule, //////////
    EditProductModule,
    SpecificationModule,
    ItemModule,
    AddItemModule,
    EditItemModule,
    StoreOrderModule,
    StoreDeliveryModule,
    StoreEarningModule,
    StoreHistoryModule,
    storeSettingModule,
    StoreViewOrderDetailModule,
    StoreViewOrderModule,
    StoreViewOrderActivityModule,
    StoreTrackDeliveryManModule,
    OrderEarningDetailModule,
    StoreUploadDocumentModule,
    StoreViewCartModule,
    // Modules
    AdminLayoutsModule,
    StoreLayoutsModule,

    StoreCreateOrderModule,
    StoreCheckoutOrderModule,
    ImageCropperModule,
    BrowserAnimationsModule,
    MomentModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    NgbModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerImmediately',
    }),
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'AED ' },

    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    Helper,
    Data,
    Router_id,
    StoreCart,
    NgbActiveModal,
    SocketService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
