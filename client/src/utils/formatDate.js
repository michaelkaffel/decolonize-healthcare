const formatDate = (str) => 
    new Date(`${str}T12:00:00`).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });

    export default formatDate;