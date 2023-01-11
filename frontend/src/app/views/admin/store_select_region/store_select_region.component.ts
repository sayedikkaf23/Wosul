import { Component, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Helper } from "../../store_helper";

declare var google: any;
declare var jQuery: any;

@Component({
  selector: "app-store_select_region",
  templateUrl: "./store_select_region.component.html",
  providers: [Helper],
})
export class StoreSelectRegionComponent implements OnInit {
  // locationPolygon: google.maps.Polygon;
  locationPolygon: any[] = [];
  store_markers: any[] = [];
  store_list: any[] = [];
  filtered_store_list: any = [];
  country_list: any[] = [];
  delivery_list: any[] = [];
  selected_country: string = "All";
  selected_delivery: string = "All";
  type: string = "All";
  map: any;
  title: any;
  current_index;
  // poly test

  radius_regions: any[] = [];
  drawingManager: any;
  city_radius_drawingManager: any;
  cityCircle: any;
  store_setting: any;
  selectedShape: any;
  selectedColor: any;
  colors: any[] = ["#1E90FF", "#FF1493", "#32CD32", "#FF8C00", "#4B0082"];
  colorButtons: any = {};
  upDateValue: any = {};

  // city_radius_map: any = '';
  // poly test
  city_radius_map: any = "";
  button: any;
  heading_title: any;
  myLoading: boolean = true;
  @ViewChild('myModal')
  myModal: NgbModal;

  constructor(
    public helper: Helper,
    private modalService: NgbModal
    ) {}
  ngAfterViewInit() {
    jQuery(".chosen-select").chosen({ disable_search: true });

    setTimeout(function () {
      jQuery(".chosen-select").trigger("chosen:updated");
    }, 1000);
  }

  ngOnInit() {
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.store_setting = this.helper.router_id.admin.store_setting;
    this.radius_regions  = this.store_setting.radius_regions
    if (
      this.store_setting &&
      this.store_setting.radius_regions &&
      this.store_setting.radius_regions.length > 0
    ) {
      for (let i = 0; i < this.store_setting.radius_regions.length; i++) {
        const a = this.store_setting.radius_regions[i];
        const coordinates = [];
        if (a) {
          for (let j = 0; j < a.kmlzone.coordinates[0].length; j++) {
            const b = a.kmlzone.coordinates[0][j];
            coordinates.push(new google.maps.LatLng(b[1], b[0]));
          }
          this.locationPolygon.push(
            new google.maps.Polygon({
              paths: coordinates,
              draggable: true,
              editable: true,
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#FF0000",
              fillOpacity: 0.35,
              index : a.index
            })
          );
        }
      }
    }

    var directionsDisplay = new google.maps.DirectionsRenderer();

    navigator.geolocation.getCurrentPosition((position) => {
      this.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 11,
        streetViewControl: false,
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      });

      this.locationPolygon.forEach((arra, index) => {
        arra.setMap(this.map);
        arra.addListener('click', 
        ()=>{
          console.log('click event :>> ', arra); 
          this.current_index = arra.index
          if(arra.strokeColor == "#000000"){
            arra.setOptions({strokeColor : "#FF0000"})
          }else{
            arra.setOptions({strokeColor : "#000000"})
          }
          // arra.
        })
      });
      //this.locationPolygon.setMap(this.map);

      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: "#ffff00",
          fillOpacity: 0.3,
          editable: true,
          strokeWeight: 2,
          clickable: true,
          draggable: true,
          zIndex: 1,
        },
      });
      this.drawingManager.setMap(this.map);

      this.city_radius_drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: "black",
          fillOpacity: 0.3,
          strokeWeight: 2,
          clickable: true,
          draggable: true,
          zIndex: 1,
        },
      });

      this.city_radius_drawingManager.setMap(this.city_radius_map);

      var infoWindow = null;
      google.maps.event.addListener(
        this.drawingManager,
        "overlaycomplete",
        (polygon) => {
          var shape = polygon.overlay;
          shape.type = polygon.type;4
          this.radius_regions = this.store_setting.radius_regions
          shape.index = this.store_setting.radius_regions.length;
          // shape.title = 'Polygon ' + (this.city_zone.length + 1);
          console.log('this.radius_regions :>> ', this.radius_regions);
          this.drawingManager.setDrawingMode(null);
          let location_array = [];

          shape
            .getPath()
            .getArray()
            .forEach((location) => {
              location_array.push([location.lng(), location.lat()]);
            });

          //      var obj = [
          // [55.28056549062241, 25.23442149090145],
          // [55.242114578515626, 25.18844994977921],
          // [55.3121524203125, 25.172293665557422],
          // [55.28056549062241, 25.23442149090145]
          // ];

          let json = {
            kmlzone: { type: "Polygon", coordinates: [location_array] },
            index: this.radius_regions.length || 0,
            color: shape.get("fillColor") || "",
            title: shape.title || "",
            price: 2,
            delivery_fees : 2,
            timeMin: 30,
            timeMax: 45
          };

          this.radius_regions.push(json);

          var locations = shape.getPath().getArray();

          var html =
            '<div><input type="text" id="title" placeholder="Title" name="title"/></div><br>' +
            '<div><input type="color" id="color"  name="color"/></div><br>' +
            '<div><input type="text" id="price" placeholder="Price" name="price"/></div><br>' +
            '<div><input type="text" id="delivery_fees" placeholder="Delivery Fees" name="delivery_fees"/></div><br>' +
            '<div><input type="text" id="timeMin" placeholder="Time Min" name="timeMin"/></div><br>' +
            '<div><input type="text" id="timeMax" placeholder="Time Max" name="timeMax"/></div><br>' +
            '<div><button id="submit_title"  type="button" style="text-align: center;">Submit</button></div>';

          if (infoWindow) {
            infoWindow.close();
          }

          infoWindow = new google.maps.InfoWindow();
          infoWindow.setContent(html);
          infoWindow.setPosition(locations[0]);
          infoWindow.open(this.map, shape);
          console.log('html :>> ', html);
          this.selectedShape = shape
          setTimeout(() => {
            jQuery("#submit_title").on("click", (event, res_data) => {
              console.log('this.selectedShape :>> ', shape);
              if (this.selectedShape) {
                if (jQuery("#title").val() != "") {
                  console.log('title :>> ', jQuery("#title").val());
                  this.selectedShape.set("title", jQuery("#title").val());
                  this.radius_regions[this.selectedShape.index].title = jQuery(
                    "#title"
                  ).val();
                  shape.title = jQuery("#title").val();
                }
                if (jQuery("#color").val() != "") {
                  this.makeColorButton(jQuery("#color").val());
                  this.selectedShape.set("color", jQuery("#color").val());
                  this.radius_regions[this.selectedShape.index].color = jQuery(
                    "#color"
                  ).val();
                  shape.color = jQuery("#color").val();
                }
                if (jQuery("#price").val() != "") {
                  this.selectedShape.set("price", jQuery("#price").val());
                  this.radius_regions[this.selectedShape.index].price = Number(jQuery(
                    "#price"
                  ).val())
                  shape.price = Number(jQuery("#price").val());
                }
                if (jQuery("#delivery_fees").val() != "") {
                  this.selectedShape.set("delivery_fees", jQuery("#delivery_fees").val());
                  this.radius_regions[this.selectedShape.index].delivery_fees = Number(jQuery(
                    "#delivery_fees"
                  ).val())
                  shape.delivery_fees = jQuery("#delivery_fees").val();
                }
                if (jQuery("#timeMin").val() != "") {
                  this.selectedShape.set("timeMin", jQuery("#timeMin").val());
                  this.radius_regions[
                    this.selectedShape.index
                  ].timeMin = Number(jQuery("#timeMin").val());
                  shape.timeMin = jQuery("#timeMin").val();
                }
                if (jQuery("#timeMax").val() != "") {
                  this.selectedShape.set("timeMax", jQuery("#timeMax").val());
                  this.radius_regions[
                    this.selectedShape.index
                  ].timeMax = Number(jQuery("#timeMax").val());
                  shape.timeMax = jQuery("#timeMax").val();
                }
                infoWindow.close();
              }
            });
          }, 1000);

          google.maps.event.addListener(shape, "click", (e) => {
            if (infoWindow) {
              infoWindow.close();
            }

            this.setSelection(shape);
            var locations = shape.getPath().getArray();
            var html =
              '<div><input type="text" id="edit_title" name="title"/></div><br>' +
              '<div><input type="color" id="edit_color" name="color"/></div><br>' +
              '<div><button id="update_title" type="button" style="text-align: center;">Update</button></div>';

            infoWindow = new google.maps.InfoWindow();
            infoWindow.setContent(html);
            infoWindow.setPosition(locations[0]);
            infoWindow.open(this.map, shape);
            jQuery("#edit_title").val(shape.title);
            jQuery("#edit_color").val(shape.color);
            setTimeout(() => {
              jQuery("#update_title").on("click", (event, res_data) => {
                if (this.selectedShape) {
                  // if (jQuery('#edit_color').val() != '') {
                  //     this.makeColorButton(jQuery('#edit_color').val())
                  //     this.selectedShape.set('color', jQuery('#edit_color').val());
                  //     this.city_zone[this.selectedShape.index].color = jQuery('#edit_color').val();
                  //     shape.color = jQuery('#edit_color').val();
                  // }
                  // if (jQuery('#edit_title').val() != '') {
                  //     this.selectedShape.set('title', jQuery('#edit_title').val());
                  //     this.city_zone[this.selectedShape.index].title = jQuery('#edit_title').val();
                  //     shape.title = jQuery('#edit_title').val();
                  // }
                  infoWindow.close();
                }
              });
            }, 1000);
          });
        }
      );
    });

    // poly test ends

    this.helper.http
      .get("api/admin/get_country_list")
      .subscribe((res_data : any) => {
        if (res_data.success) {
          this.country_list = res_data.countries;
        } else {
          this.country_list = [];
        }
      });
    setTimeout(function () {
      jQuery("#selected_country").trigger("chosen:updated");
    }, 1000);

    this.helper.http
      .get("admin/delivery_list")
      .subscribe((res_data: any) => {
        if (res_data.success) {
          this.delivery_list = res_data.deliveries;
        } else {
          this.delivery_list = [];
        }
      });
    setTimeout(function () {
      jQuery("#selected_delivery").trigger("chosen:updated");
    }, 1000);

    this.helper.http
      .post("/admin/store_list_for_map", {})
      .subscribe((res_data: any) => {
        if (res_data.success) {
          this.store_list = res_data.stores;
          this.check_open(res_data.server_time);
        } else {
          this.store_list = [];
        }
      });

    jQuery(document.body)
      .find("#selected_country")
      .on("change", (evnt, res_data) => {
        this.selected_country = res_data.selected;
        // this.check_country()
      });

    jQuery(document.body)
      .find("#selected_delivery")
      .on("change", (evnt, res_data) => {
        this.selected_delivery = res_data.selected;
        // this.check_delivery()
      });

    jQuery(document.body)
      .find("#type")
      .on("change", (evnt, res_data) => {
        this.type = res_data.selected;
        // this.check_country();
        // this.check_delivery();
      });
    // });
  }

  check_country() {
    this.filtered_store_list = this.store_list.filter((store_data) => {
      return (
        this.selected_country == "All" ||
        this.selected_country == store_data.country_id
      );
    });
    this.check_provider_status();
  }

  check_delivery() {
    this.filtered_store_list = this.store_list.filter((store_data) => {
      return (
        this.selected_delivery == "All" ||
        this.selected_delivery == store_data.store_delivery_id
      );
    });
    this.check_provider_status();
  }

  check_open(server_date) {
    this.store_list.forEach((store) => {
      let date: any = server_date;
      date = new Date(date).toLocaleString("en-US", {
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
                open_time = open_time.split(":");
                let open_date_time = date.setHours(
                  open_time[0],
                  open_time[1],
                  0,
                  0
                );
                open_date_time = new Date(open_date_time);
                open_date_time = open_date_time.getTime();

                let close_time = store_time.store_close_time;
                close_time = close_time.split(":");
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
    if (this.type == "open") {
      let store_list = this.filtered_store_list.filter((store) => {
        return store.close == false;
      });
      this.create_marker(store_list);
    } else if (this.type == "close") {
      let store_list = this.filtered_store_list.filter((store) => {
        return store.close == true;
      });
      this.create_marker(store_list);
    } else if (this.type == "businessoff") {
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
      let icon_url = "/map_pin_images/Store/";
      if (!store_data.is_business) {
        icon_url = icon_url + "store_business_off.png";
      } else if (store_data.close) {
        icon_url = icon_url + "store_close.png";
      } else if (!store_data.close) {
        icon_url = icon_url + "store_open.png";
      }

      let marker = new google.maps.Marker({
        position: { lat: store_data.location[0], lng: store_data.location[1] },
        map: this.map,
        icon: icon_url,
      });
      this.store_markers.push(marker);
      var contentString =
        "<p><b>Name</b>: " +
        store_data.name +
        "<br><b>Rating</b>: " +
        store_data.user_rate +
        "</p>";

      var message = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 320,
      });

      google.maps.event.addListener(marker, "click", function (e) {
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

  setSelection(shape) {
    this.clearSelection();
    shape.setEditable(true);
    this.selectColor(shape.get("fillColor") || shape.get("strokeColor"));
    this.selectedShape = shape;
  }

  clearSelection() {
    if (this.selectedShape) {
      this.selectedShape.setEditable(false);
      this.selectedShape = null;
    }
  }

  selectColor(color) {
    this.selectedColor = color;
    var polygonOptions = this.drawingManager.get("polygonOptions");
    polygonOptions.fillColor = color;
    polygonOptions.strokeColor = color;
    this.drawingManager.set("polygonOptions", polygonOptions);
  }
  setSelectedShapeColor(color) {
    if (this.selectedShape) {
      if (this.selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
        this.selectedShape.set("strokeColor", color);
        this.selectedShape.set("fillColor", color);
        this.radius_regions[this.selectedShape.index].color = color;
      } else {
        this.selectedShape.set("strokeColor", color);
        this.selectedShape.set("fillColor", color);
        this.radius_regions[this.selectedShape.index].color = color;
      }
    }
  }

  makeColorButton(color) {
    this.selectColor(color);
    this.setSelectedShapeColor(color);
  }

  onSave() {
    var obj = [
      [55.28056549062241, 25.23442149090145],
      [55.242114578515626, 25.18844994977921],
      [55.3121524203125, 25.172293665557422],
      [55.28056549062241, 25.23442149090145],
    ];
    // var vertices = this.locationPolygon.getPath();
    // console.log(vertices);
    // for (var i =0; i < vertices.getLength(); i++) {
    //     var xy = vertices.getAt(i);
    //     obj.push([xy.lng(), xy.lat()]);
    // }

    // var xy = vertices.getAt(0);

    // obj.push([xy.lng(), xy.lat()]);
    this.helper.router_id.admin.store_setting.delivery_regions = {
      type: "Polygon",
      coordinates: [obj],
    };
    // console.log("obj,this.radius_regions === >",this.radius_regions);

    this.helper.router_id.admin.store_setting.radius_regions = this.radius_regions;
    this.helper.router.navigate(["/admin/store/setting"]);
  }
  onCancel() {
    this.helper.router.navigate(["/admin/store/setting"]);
  }
  openUpdate(region,  index){
    this.upDateValue = region
    this.modalService.open(this.myModal, { size: 'sm' });

  }
  upDateRegion(value, index){
    this.radius_regions[value.index].delivery_fees = value.delivery_fees
    this.radius_regions[value.index].price = Number(value.price)
    this.radius_regions[value.index].timeMax = value.timeMax
    this.radius_regions[value.index].timeMin = value.timeMin
    // console.log('upDateRegion :>> ', value);
    // console.log('upDateRegion index:>> ', index);

    this.modalService.dismissAll()
  }
}

