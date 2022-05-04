const socket = io();

var file;
var fn = '';

const form = document.querySelector('#myform');
const fileform = document.querySelector('#upload');
const formButton = document.querySelector('button');
const locb = document.querySelector('#sl');
const Chatcontainer =document.querySelector('#messages');


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const viewhandler = () => {
    const $nm = Chatcontainer.lastElementChild;

    const nmStyles = getComputedStyle($nm);
    const nmMargin = parseInt(nmStyles.marginBottom);
    const nmHeight = $nm.offsetHeight + nmMargin;

    const vh = Chatcontainer.offsetHeight;

    const ch = Chatcontainer.scrollHeight;

    const sos = Chatcontainer.scrollTop + vh;

    if(ch - nmHeight <= sos) {
        Chatcontainer.scrollTop = Chatcontainer.scrollHeight;
    }
}


socket.on('message-deliver', (message) => {
    //console.log(message);
    const mt = document.querySelector('#message-template').innerHTML;
    const html = Mustache.render(mt, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    Chatcontainer.insertAdjacentHTML('beforeend', html);
    viewhandler();
});

socket.on('loc', (location) => {
    const lmt = document.querySelector('#location-message-template').innerHTML;
    const html = Mustache.render(lmt, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:m a')
    });
    
    Chatcontainer.insertAdjacentHTML('beforeend', html);
    viewhandler();
});

socket.on('rd', ({ room , users }) => {
    const st = document.querySelector('#sidebar-template').innerHTML;

    const html = Mustache.render(st, {
        room,
        users
    });

    document.querySelector('#sidebar').innerHTML = html;
});

socket.on("file" , function(data){
    console.log("data recieved", data);
        // const fmt = document.querySelector('#file-message-template').innerHTML;
        // const html = Mustache.render($fmt, {
        //     username: data.username,
        //     url: data.text,
        //     createdAt: moment(data.createdAt).format('h:mm a')
        // });
        var src = data.text;
        var filename = data.filename;
        var link = document.createElement('a');
        var username = data.username;
        console.log(filename);
        var cat =  moment(data.createdAt).format('h:mm a')
        link.style.textDecoration="none";
        link.style.color = "#7c5cbf"
       // data:application/pdf
        var ext = src.substring(0,20)
        console.log(ext);
        if(ext === "data:application/pdf"){
            console.log("pdf detected");
            // var image = document.createElement('img');
            link.text = filename;
            //image.setAttribute("src",src);
            link.setAttribute("href", src);
            link.setAttribute("target", "_blank");
            var d = document.createElement('div');
            d.classList.add("filemessage");
            d.innerHTML += '<span class="mn">~' + username + '</span> <span class="mm"> ' + cat +  '</span> </br>';
            //d.style.marginTop = "10px";
            //d.style.marginBottom = "10px";
              // d.appendChild(image);
            d.appendChild(link);
            Chatcontainer.appendChild(d);
            viewhandler();
        }else{
            console.log("image file detected");
            var image = document.createElement('img');
            link.text = filename;
            image.setAttribute("src",src);
            link.setAttribute("href", src);
            link.setAttribute("target", "_blank");
            var d = document.createElement('div');
            d.innerHTML += '<span class="mn">~' + username + '</span> <span class="mm"> ' + cat +  '</span> </br>';
            d.classList.add("filemessage");
            d.appendChild(image);
            d.innerHTML += '</br>';
            d.appendChild(link);
           // d.style.marginTop = "10px";
           // d.style.marginBottom = "10px";
            Chatcontainer.appendChild(d);
            viewhandler();
        }
      

});



fileform.addEventListener('change', (event) => {
    const files = event.target.files;
    console.log(files);
    file = files[0];
    fn = file.name;
    console.log(fn);

})

const formInput = document.querySelector('input');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    formButton.setAttribute('disabled', 'disabled');
    var message = e.target.elements.message.value;
    if(file){
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
          console.log(fn);
            socket.emit('file', { image: true, buffer: event.target.result , filename : fn });
           // console.log(event.target.result);
        }
        reader.onerror = function (event) {
            console.log('Error reading file: ', event);
        }
        fileform.value ='';
        formButton.removeAttribute('disabled');
        file = null;
        filename = '';
    }
    else{
        socket.emit('sm', message, (error) => {
            formButton.removeAttribute('disabled');
            formInput.value = '';
            formInput.focus();
            if(error) {
                return console.log(error);
            }
            //console.log("Message delivered!");
        });
    }

}); 
locb.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported');
    }
    locb.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((p) => {   
        socket.emit('sl', { 
            latitude: p.coords.latitude,
            longitude: p.coords.longitude
        },() => {

            locb.removeAttribute('disabled');
        });
    });
});


socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/';
    }   
});