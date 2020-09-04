var inquirer = require('inquirer'); //library for use interavtive commands
var youtubedl = require('youtube-dl'); //library for download youtube videos
var signale = require('signale'); //library to insert status report
var asciify = require('asciify-image'); //library for create asciify images

var fs = require("fs");

showLogo(true);

/**
 * Show  or not application logo and start application
 * @param {*} logo -> to show logo or not
 */
function showLogo(logo) {

    if (logo) {
        var optionsAsciify = {
            fit: 'box',
            width: 15,
            height: 15
        };
        asciify('./images/image.png', optionsAsciify, function (err, asciified) {
            if (err) throw err;

            // Print to console
            console.log(asciified);

            start();
        })
    } else {
        start();
    }
}
/**
 * Start application
 */
function start() {

    inquirer.prompt([
        {
            // parameters
            type: "question", // type
            name: "link", //response name
            message: "Qual'è il link del video da scaricare? Ctrl+c per uscire" // question
        },
        {
            type: "question",
            name: "subtitles",
            message: "Vuoi i sottotitoli? (S/N)"
        }
    ])
        .then(answers => {

            const video = youtubedl(answers.link,
                // Optional arguments passed to youtube-dl.
                ['--format=18'],
                // Additional options can be given for calling `child_process.execFile()`.
                { cwd: __dirname }

            )

            // Will be called when the download starts.
            video.on('info', function (info) {
                var size = info.size / 1000000;
                size = size.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
                signale.info('Nome del video: ' + info._filename)
                signale.info('Dimensioni: ' + size + " MB")
                signale.pending('Inizio a scaricare il video');
                
                //download video
                video.pipe(fs.createWriteStream(info._filename + '.mp4'))
            });

            //When downloading is finished
            video.on('end', function () {
                signale.success("Il video è stato scaricato");

                //if you want subtitles
                if (answers.subtitles.toUpperCase() === "S") {
                    signale.pending("Inizio a scaricare i sottotitoli");

                    const options = {
                        // Write automatic subtitle file (youtube only)
                        auto: false,
                        // Downloads all the available subtitles.
                        all: false,
                        // Subtitle format. YouTube generated subtitles
                        // are available ttml or vtt.
                        format: 'ttml',
                        // Languages of subtitles to download, separated by commas.
                        lang: 'it, en',
                        // The directory to save the downloaded files in.
                        cwd: __dirname + "/Sottotitoli",
                    }

                    youtubedl.getSubs(answers.link, options, function (err, files) {
                        if (err) throw err

                        //if thesubtitles are presents
                        if (files.length > 0) {
                            signale.success('I sottotitoli sono stati scaricati:', files);
                        } else {
                            signale.fatal("I sottotitoli non sono disponibili");
                        }
                    })
                }
                //Restart application while user send Ctrl+c command
                showLogo(false);
            })

        })
}