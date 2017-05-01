function Search() {

    let ProductsSearch = $('#productname').val();
    if(ProductsSearch == ""){
    $('#headtable').html('<div class="col-md-12 text-center"><h2>กรุณากรอกรายละเอียดสินค้าที่คุณต้องการ</h2></div>');
    }else{
    $('#headtable').html('<div class="col-md-12 text-center" style="margin-top:50px;"><img src="ring-alt.svg"></div>');
    let Selection = $('#selection').val();
    let Select
    if (Selection == "ProductID") {
        Select = "Products"
    };
    if (Selection == "Name") {
        Select = "Products/ProductName"
    };
    if (Selection == "ProductCategoryID") {
        Select = "Products/Catagory"
    };
    $('#resultproduct').html('');
    getProduct(Select, ProductsSearch);
  }
}

function getProduct(Select, ProductsSearch) {
    let Selection = Select;
    let PSearch = ProductsSearch;
    $.ajax({
            statusCode: {
                404: function() {
                      $('#headtable').html('<div class="col-md-12 text-center"><h2>ไม่มีรายการการสินค้าที่คุณต้องการ</h2></div>')
                }},
                method: "GET",
                url: "http://977377searchproducts.azurewebsites.net/api/v1/Search/" + Selection + "/" + PSearch
            })
        .done(function(response) {
            var count = response.length;
            console.log(response);
            if (count >= 1) {
                $.each(response, function(i, val) {
                    getDetail(response[i]);
                });
            } else if (count == 0) {
                $('#headtable').html('<div class="col-md-12 text-center"><h2>ไม่มีรายการการสินค้าที่คุณต้องการ</h2></div>');
            } else {
                getDetail(response);
            }
        });
    }



    function getDetail(res) {
        $('#headtable').html('<table id="myTable" class="table table-hover"><thead style="font-weight:bold;"><tr><td>Product Image</td><td>Product ID</td><td>Product Name</td><td>Color</td><td>Size</td><td>Price</td><td>Qty Sale</td><td>Sum Price</td><td>Action</td></tr></thead><tbody id="resultproduct"></tbody></table>');
        $.ajax({
                method: "GET",
                url: "http://saleorderdetail.azurewebsites.net/OrderDetail/Search/ProductID/" + res.ProductID,
            })
            .done(function(response) {
                var count = response.length;

                if (count >= 1) {
                    var countqty = 0;
                    var saleID = 0;
                    $.each(response, function(i, val) {
                        countqty = countqty + response[i].OrderQty;
                        saleID = response[i].SalesOrderID;
                    });
                    console.log(countqty);
                    var sumprice = res.ListPrice * countqty;
                    $('#resultproduct').append('<tr><td><img src="data:image/png;base64, ' + res.ThumbNailPhoto + '" alt="Red dot" /></td><td>' + res.ProductID + '</td><td>' + res.Name + '</td><td>' + res.Color + '</td><td>' + res.Size + '</td><td>' + res.ListPrice + '</td><td>' + countqty + '</td><td>' + sumprice.toFixed(2) + '</td><td><button class="btn btn-info" onclick="ViewDetail(' + res.ProductID + ')"><i class="glyphicon glyphicon-eye-open"></i></button></td></tr>');
                } else {

                    $('#resultproduct').append('<tr><td><img src="data:image/png;base64, ' + res.ThumbNailPhoto + '" alt="Red dot" /></td><td>' + res.ProductID + '</td><td>' + res.Name + '</td><td>' + res.Color + '</td><td>' + res.Size + '</td><td>' + res.ListPrice + '</td><td>0</td><td>0</td><td><button class="btn btn-info" onclick="" disabled><i class="glyphicon glyphicon-eye-open"></i></button></td></tr>');

                }

            });
    }

    function ViewDetail(id) {
        window.open('detail.html?OrderID=' + id, 'mywindow', 'width=1300,height=800')
    }

    function ShowDetail(pid) {

        //http://testsaleorder.azurewebsites.net/api/v1/SalesOrderHeaders/Search/"+pid
        $.ajax({
                method: "GET",
                url: "http://saleorderdetail.azurewebsites.net/OrderDetail/Search/ProductID/" + pid,
            })
            .done(function(response) {
                var count = response.length;
                if (count >= 1) {
                    $.each(response, function(i, val) {
                        SearchOrderID(response[i]);
                    });
                } else {
                    SearchOrderID(response);
                }

            });
    }

    function SearchOrderID(res) {
        var Orderdetail = res;
        var OrderID = res.SalesOrderID
        $.ajax({
                method: "GET",
                url: "http://testsaleorder.azurewebsites.net/api/v1/SalesOrderHeaders/Search/" + OrderID,
            })
            .done(function(response) {
                SearchCustomer(response, Orderdetail);
            });
    }

    function SearchCustomer(Header, Orderdetail) {
        var SaleOrderHeader = Header;
        var SaleOrderDetail = Orderdetail;
        var CusID = SaleOrderHeader.CustomerID;
        $.ajax({
                method: "GET",
                url: "http://customerservices.azurewebsites.net/Customers/Search/CustomerID/" + CusID,
            })
            .done(function(response) {
                ResultProduct(SaleOrderHeader, response[0], SaleOrderDetail);
            });

    }

    function ResultProduct(SaleOrderHeader, Customer, SaleOrderDetail) {
        var CusID = Customer.CustomerID;
        var CusName = Customer.FirstName;
        var CusLast = Customer.LastName;
        var CusEmail = Customer.EmailAddress;
        var SaleQty = SaleOrderDetail.OrderQty;
        var LineTotal = SaleOrderDetail.LineTotal;
        var OrderDate = SaleOrderHeader.OrderDate;

        $('#resultdetail').append('<tr><td>' + CusID + '</td><td>' + CusName + '</td><td>' + CusLast + '</td><td>' + CusEmail + '</td><td>' + SaleQty + '</td><td>' + LineTotal + '</td><td>' + OrderDate + '</td></tr>');

    }
