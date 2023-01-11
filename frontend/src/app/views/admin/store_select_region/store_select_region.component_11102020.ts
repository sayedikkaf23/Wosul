import { Component, OnInit } from '@angular/core';

import { Helper } from '../../store_helper';

import { Observable } from 'rxjs/Rx';

declare var google: any;
import jQuery from 'jquery';

@Component({
  selector: 'app-store_select_region',
  templateUrl: './store_select_region.component.html',
  providers: [Helper],
})
export class StoreSelectRegionComponent implements OnInit {
  locationPolygon: google.maps.Polygon;
  store_markers: any[] = [];
  store_list: any[] = [];
  filtered_store_list: any = [];
  country_list: any[] = [];
  delivery_list: any[] = [];
  selected_country: string = 'All';
  selected_delivery: string = 'All';
  type: string = 'All';
  map: any = '';
  title: any;
  // poly test

  radius_zone: any[] = [];
  drawingManager: any;
  city_radius_drawingManager: any;
  cityCircle: any;
  // city_radius_map: any = '';
  // poly test

  button: any;
  heading_title: any;
  myLoading: boolean = true;

  constructor(public helper: Helper) {}
  ngAfterViewInit() {
    jQuery('.chosen-select').chosen({ disable_search: true });

    setTimeout(function () {
      jQuery('.chosen-select').trigger('chosen:updated');
    }, 1000);
  }

  ngOnInit() {
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;

    console.log(this.helper);
    console.log(this.helper.router_id.admin.store_setting);

    var directionsDisplay = new google.maps.DirectionsRenderer();
    navigator.geolocation.getCurrentPosition((position) => {
      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        streetViewControl: false,
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      });

      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: '#ffff00',
          fillOpacity: 0.3,
          editable: true,
          strokeWeight: 2,
          clickable: true,
          draggable: true,
          zIndex: 1,
        },
      });
      this.drawingManager.setMap(this.map);

      // this.city_radius_drawingManager = new google.maps.drawing.DrawingManager({
      //     drawingMode: google.maps.drawing.OverlayType.POLYGON,
      //     drawingControl: true,
      //     drawingControlOptions: {
      //         position: google.maps.ControlPosition.TOP_CENTER,
      //         drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      //     },
      //     polygonOptions: {
      //         fillColor: 'black',
      //         fillOpacity: 0.3,
      //         strokeWeight: 2,
      //         clickable: true,
      //         draggable: true,
      //         zIndex: 1
      //     }
      // });

      // this.city_radius_drawingManager.setMap(this.city_radius_map);

      google.maps.event.addListener(
        this.drawingManager,
        'overlaycomplete',
        (polygon) => {
          console.log('ikkaf');
          console.log(polygon);

          var shape = polygon.overlay;
          shape.type = polygon.type;
          shape.index = this.radius_zone.length;
          // shape.title = 'Polygon ' + (this.city_zone.length + 1);
          this.drawingManager.setDrawingMode(null);
          let location_array = [];

          shape
            .getPath()
            .getArray()
            .forEach((location) => {
              location_array.push([location.lng(), location.lat()]);
            });
          console.log(location_array);

          let json = {
            kmlzone: location_array,
            index: this.radius_zone.length,
            color: shape.get('fillColor'),
            title: shape.title,
            price: 2,
          };

          console.log('sayed');
          console.log(json);
          this.radius_zone.push(json);
          // this.setSelection(shape);
        }
      );
    });

    // poly test ends

    this.helper.http
      .get('api/admin/get_country_list')
      .subscribe((res_data: any) => {
        if (res_data.success) {
          this.country_list = res_data.countries;
        } else {
          this.country_list = [];
        }
      });
    setTimeout(function () {
      jQuery('#selected_country').trigger('chosen:updated');
    }, 1000);

    this.helper.http.get('admin/delivery_list').subscribe((res_data: any) => {
      if (res_data.success) {
        this.delivery_list = res_data.deliveries;
      } else {
        this.delivery_list = [];
      }
    });
    setTimeout(function () {
      jQuery('#selected_delivery').trigger('chosen:updated');
    }, 1000);

    this.helper.http
      .post('/admin/store_list_for_map', {})
      .subscribe((res_data: any) => {
        if (res_data.success) {
          this.store_list = res_data.stores;
          this.check_open(res_data.server_time);
        } else {
          this.store_list = [];
        }
      });

    jQuery(document.body)
      .find('#selected_country')
      .on('change', (evnt, res_data) => {
        this.selected_country = res_data.selected;
        // this.check_country()
      });

    jQuery(document.body)
      .find('#selected_delivery')
      .on('change', (evnt, res_data) => {
        this.selected_delivery = res_data.selected;
        // this.check_delivery()
      });

    jQuery(document.body)
      .find('#type')
      .on('change', (evnt, res_data) => {
        this.type = res_data.selected;
        // this.check_country();
        // this.check_delivery();
      });
    // });
  }

  check_country() {
    this.filtered_store_list = this.store_list.filter((store_data) => {
      return (
        this.selected_country == 'All' ||
        this.selected_country == store_data.country_id
      );
    });
    this.check_provider_status();
  }

  check_delivery() {
    this.filtered_store_list = this.store_list.filter((store_data) => {
      return (
        this.selected_delivery == 'All' ||
        this.selected_delivery == store_data.store_delivery_id
      );
    });
    this.check_provider_status();
  }

  check_open(server_date) {
    this.store_list.forEach((store) => {
      let date: any = server_date;
      date = new Date(date).toLocaleString('en-US', {
        timeZone: store.city_detail.timezone,
      });
      date = new Date(date);
      let weekday = date.getDay();
      let current_time = date.getTime();
      store.close = true;
      let week_index = store.store_time.findIndex((x) => x.day == weekday);
      if (week_index !== -1) {
        let day_time = store.store_time[week_index].day_time;
        if (store.store_time[week_index].is_store_open_full_time) {
          store.close = false;
        } else {
          if (store.store_time[week_index].is_store_open) {
            if (day_time.length == 0) {
              store.close = true;
            } else {
              day_time.forEach((store_time, index) => {
                let open_time = store_time.store_open_time;
                open_time = open_time.split(':');
                let open_date_time = date.setHours(
                  open_time[0],
                  open_time[1],
                  0,
                  0
                );
                open_date_time = new Date(open_date_time);
                open_date_time = open_date_time.getTime();

                let close_time = store_time.store_close_time;
                close_time = close_time.split(':');
                let close_date_time = date.setHours(
                  close_time[0],
                  close_time[1],
                  0,
                  0
                );
                close_date_time = new Date(close_date_time);
                close_date_time = close_date_time.getTime();

                if (
                  current_time > open_date_time &&
                  current_time < close_date_time
                ) {
                  store.close = false;
                }
              });
            }
          } else {
            store.close = true;
          }
        }
      }
    });
    this.filtered_store_list = JSON.parse(JSON.stringify(this.store_list));
    this.create_marker(this.filtered_store_list);
  }

  check_provider_status() {
    if (this.type == 'open') {
      let store_list = this.filtered_store_list.filter((store) => {
        return store.close == false;
      });
      this.create_marker(store_list);
    } else if (this.type == 'close') {
      let store_list = this.filtered_store_list.filter((store) => {
        return store.close == true;
      });
      this.create_marker(store_list);
    } else if (this.type == 'businessoff') {
      let store_list = this.filtered_store_list.filter((store) => {
        return store.is_business == false;
      });
      this.create_marker(store_list);
    } else {
      this.create_marker(this.filtered_store_list);
    }
  }

  create_marker(store_list) {
    this.store_markers.forEach(function (marker) {
      marker.setMap(null);
    });
    this.store_markers = [];
    store_list.forEach((store_data, index) => {
      let icon_url = '/map_pin_images/Store/';
      if (!store_data.is_business) {
        icon_url = icon_url + 'store_business_off.png';
      } else if (store_data.close) {
        icon_url = icon_url + 'store_close.png';
      } else if (!store_data.close) {
        icon_url = icon_url + 'store_open.png';
      }

      let marker = new google.maps.Marker({
        position: { lat: store_data.location[0], lng: store_data.location[1] },
        map: this.map,
        icon: icon_url,
      });
      this.store_markers.push(marker);
      var contentString =
        '<p><b>Name</b>: ' +
        store_data.name +
        '<br><b>Rating</b>: ' +
        store_data.user_rate +
        '</p>';

      var message = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 320,
      });

      google.maps.event.addListener(marker, 'click', function (e) {
        message.open(this.map, marker);
        setTimeout(function () {
          message.close();
        }, 5000);
      });

      if (index == store_list.length - 1) {
        this.myLoading = false;
      }
    });
  }

  deg2rad(degrees) {
    return (Math.PI * degrees) / 180.0;
  }

  rad2deg(radians) {
    return (180.0 * radians) / Math.PI;
  }

  //Earth radius at a given latitude, according to the WGS-84 ellipsoid [m]
  WGS84EarthRadius(lat) {
    // Semi-axes of WGS-84 geoidal reference
    var WGS84_a = 6378137.0; // Major semiaxis [m]
    var WGS84_b = 6356752.3; // Minor semiaxis [m]

    var An = WGS84_a * WGS84_a * Math.cos(lat);
    var Bn = WGS84_b * WGS84_b * Math.sin(lat);
    var Ad = WGS84_a * Math.cos(lat);
    var Bd = WGS84_b * Math.sin(lat);
    return Math.sqrt((An * An + Bn * Bn) / (Ad * Ad + Bd * Bd));
  }

  // Bounding box surrounding the point at given coordinates,
  // assuming local approximation of Earth surface as a sphere
  // of radius given by WGS84
  createPolygon(latitudeInDegrees, longitudeInDegrees, halfSideInKm) {
    var lat = this.deg2rad(latitudeInDegrees);
    var lon = this.deg2rad(longitudeInDegrees);
    var halfSide = 1000 * halfSideInKm;

    // Radius of Earth at given latitude
    var radius = this.WGS84EarthRadius(lat);

    // Radius of the parallel at given latitude
    var pradius = radius * Math.cos(lat);

    var latMin = lat - halfSide / radius;
    var latMax = lat + halfSide / radius;
    var lonMin = lon - halfSide / pradius;
    var lonMax = lon + halfSide / pradius;

    var latMin = this.rad2deg(latMin);
    var latMax = this.rad2deg(latMax);
    var lonMin = this.rad2deg(lonMin);
    var lonMax = this.rad2deg(lonMax);

    var squareCoords = [
      new google.maps.LatLng(latMin, lonMin),
      new google.maps.LatLng(latMin, lonMax),
      new google.maps.LatLng(latMax, lonMax),
      new google.maps.LatLng(latMax, lonMin),
    ];

    return squareCoords;
  }

  onSave() {
    console.log('Save clicked');
    // var obj = [];
    // var vertices = this.locationPolygon.getPath();
    // console.log(vertices);
    // for (var i =0; i < vertices.getLength(); i++) {
    //     var xy = vertices.getAt(i);
    //     obj.push([xy.lng(), xy.lat()]);
    // }

    // var xy = vertices.getAt(0);

    // obj.push([xy.lng(), xy.lat()]);
    // this.helper.router_id.admin.store_setting.delivery_regions = {type: 'Polygon', coordinates: [obj]};
    // console.log("obj,this.radius_zone === >",this.radius_zone);

    this.helper.router_id.admin.store_setting.delivery_regions = {
      type: 'Polygon',
      coordinates: this.radius_zone,
    };
    this.helper.router.navigate(['/admin/store/setting']);
  }
  onCancel() {
    // this.helper.router.navigate(['/admin/store/setting']);
  }
}
