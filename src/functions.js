const users = [];

const Usercreate = ( { id, u, r } ) => {
    u = u.trim().toLowerCase()
    r = r.trim().toLowerCase();
     
    if(!u || !r) {
        return {
            error: 'Username and room must be given!'
        }
    }

    const eu = users.find((user) => {
        return user.username === u && user.room === r;
    });

    if(eu) {
        return {
            error: 'already in use! choose another username.'
        }
    }

    const user = { id :id, username :u, room: r };
    users.push(user);

    return { user };
}   

const Userdelete = (id) => {
    const i = users.findIndex(u => {
        return u.id === id;
    });
    
    if(i !== -1) {
        return users.splice(i, 1)[0];
    }
}

const ReturnUser = (id) => {
    return users.find(u => {
        return u.id === id;
    });
}

const ReturnUsersInRoom = (r) => {
    r = r.trim().toLowerCase();  
    return users.filter(u => {
        return u.room === r;
    }); 
}



const messageTemplate = (u, t) => {
    return  {
        username : u,
        text : t,
        createdAt: new Date().getTime()
    }
}

const fileMessageTemplate = (u,t, filename) => {
    return  {
        username : u,
        text : t,
        filename ,
        createdAt: new Date().getTime()
    }
}


const locationMessageTemplate = (u, link) => {
    return {
        username : u,
        url : link,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    Usercreate,
    Userdelete,
    ReturnUser,
    ReturnUsersInRoom,
    messageTemplate,
    fileMessageTemplate,
    locationMessageTemplate
}