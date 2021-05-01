document.addEventListener('DOMContentLoaded', () =>
    {

        // Use buttons to toggle between views
        document.querySelector('#inbox').addEventListener('click', () => { loadMailbox('inbox') });
        document.querySelector('#sent').addEventListener('click', () => { loadMailbox('sent') });
        document.querySelector('#archived').addEventListener('click', () => { loadMailbox('archive') });
        document.querySelector('#compose').addEventListener('click', composeEmail);
        document.querySelector('form').onsubmit = sendEmail;

        // By default, load the inbox
        loadMailbox('inbox');
    });


function replyEmail(email)
{
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-detail').style.display = 'none';

    recipient = document.querySelector('#compose-recipients');
    recipient.value = email.sender;
    recipient.disabled = true;

    if(email.subject.indexOf("Re:") === -1)
        email.subject = "Re: " + email.subject;
    subject = document.querySelector('#compose-subject');
    subject.value = email.subject;
    subject.disabled = true;

    document.querySelector('#compose-body').value = `\nOn ${email.timestamp}\n${email.sender} wrote: \n\n${email.body}`;
}


function changeEmailArchive(emailId, currentBox)
{
    const changedBox = !currentBox;

    fetch(`/emails/${emailId}`,
    {
        method: 'PUT',
        body: body = JSON.stringify({archived: changedBox})
    })

    loadMailbox('inbox');
    window.location.reload();
}


function markEmailAsRead(emailId)
{
    fetch(`/emails/${emailId}`,
    {
        method: 'PUT',
        body: body = JSON.stringify({read: true})
    })
}


function viewEmail(emailId)
{
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-detail').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    fetch(`/emails/${emailId}`)
        .then(response => response.json())
            .then(email =>
            {
                markEmailAsRead(emailId);

                document.querySelector('#email-view-sender').innerHTML = email.sender;
                document.querySelector('#email-view-recipients').innerHTML = email.recipients;
                document.querySelector('#email-view-subject').innerHTML = email.subject;
                document.querySelector('#email-view-timestamp').innerHTML = email.timestamp;
                document.querySelector('#email-view-body').innerHTML = email.body;

                document.getElementById('reply-email-button').addEventListener('click', () => replyEmail(email));
            })

    return false;
}


function sendEmail()
{
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch(`/emails`,
    {
        method: 'POST',
        body: JSON.stringify(
        {
            recipients: recipients,
            subject: subject,
            body: body
        })
    })
        .then(response => response.json())
            .then(result => console.log(result))

    localStorage.clear();
    console.log('mail sent')
    loadMailbox('sent');
    return false;
}


function composeEmail()
{

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function showEmail(email, mailbox)
{
    const emailDiv = document.createElement('div');
    emailDiv.id = "email";
    emailDiv.className = "row";

    const recipient = document.createElement('div');
    recipient.id = "email-recipient";
    recipient.className = "col-lg-2 col-md-3 col-sm-12";

    if(mailbox === "inbox")
        recipient.innerHTML = email.sender;
    else
        recipient.innerHTML = email.recipients[0];
    emailDiv.append(recipient);

    const subject = document.createElement('div');
    subject.id = "email-subject";
    subject.className = "col-lg-2 col-md-3 col-sm-12";
    subject.innerHTML = email.subject;
    emailDiv.append(subject);

    const timestamp = document.createElement('div');
    timestamp.id = "email-timestamp";
    timestamp.className = "col-lg-3 col-md-3 col-sm-12";
    timestamp.innerHTML = email.timestamp;
    emailDiv.append(timestamp);


    if(mailbox !== "sent")
    {
        const button = document.createElement('img');
        button.id = "archive-icon";
        button.src = "https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_archive_48px-512.png"
        button.width = "25"
        button.innerHTML = "Archive";
        emailDiv.append(button);
        button.addEventListener('click', () => changeEmailArchive(email.id, email.archived));
    }

    const emailCard = document.createElement('div');
    emailCard.id = "email-card";
    if(email.read)
        emailCard.className = "read-card";
    else
        emailCard.className = "card";
    emailCard.append(emailDiv);


    recipient.addEventListener('click', () => viewEmail(email.id));
    subject.addEventListener('click', () => viewEmail(email.id));
    timestamp.addEventListener('click', () => viewEmail(email.id));
    document.querySelector('#emails-view').append(emailCard);
}


function loadMailbox(mailbox)
{
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail').style.display = 'none';
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
        .then(emails => { emails.forEach(email => showEmail(email, mailbox)); })
}