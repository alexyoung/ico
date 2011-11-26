Ico is a JavaScript graph library that uses [Raphael](http://raphaeljs.com/) to draw.  This means it can draw charts in multiple browsers (including IE).

Get it at GitHub: [alexyoung / ico](https://github.com/alexyoung/ico) or [view examples](http://alexyoung.github.com/ico/examples.html).

The API uses a data parameter then an additional option for customisation:

     new Ico.BarGraph(dom_element, data, options);

An array or object can be passed as data:

     new Ico.BarGraph(dom_element, [1, 2, 3, 4], { grid: true });

     new Ico.BarGraph($('dom_element'), {
         shoe_size: [1, 1, 1, 0, 2, 4, 6, 8, 3, 9, 6]
       },
       { colours: {shoe_size: '#990000' },
         grid: true });

## Support

[Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=support%40helicoid%2enet&lc=GB&item_name=Helicoid%20Limited&no_note=0&cn=Add%20special%20instructions%20to%20the%20seller&no_shipping=2&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)
