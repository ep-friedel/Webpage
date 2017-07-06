/*-----------------------------------------------------------------
---------------------------- Exercise -----------------------------
-----------------------------------------------------------------*/
class exercise extends React.Component {
    constructor(props) {
        super();
        let i,
            pastResults = props.pastResults;

        this.state =  {
            display: 'minified',
            completed: false,
            newResults: [],
            currentRep: {
                repetition: 1,
                reps: pastResults[pastResults.length - 1][0].reps,
                weight: pastResults[pastResults.length - 1][0].weight
            }
        };

        if (props.newResults) {
            this.state.newResults = props.newResults;
        } else {
            for (i = 0; i < props.details.repetitions; i++) {
                this.state.newResults.push({reps: undefined, weight: undefined});
            }
        }
    }

    changedReps(newNumber) {
        let changedRep = Object.assign({}, this.state.currentRep, {reps: parseFloat(newNumber)});

        this.setState({
            currentRep: changedRep
        });
    }

    changedWeight(newNumber) {
        let changedRep = Object.assign({}, this.state.currentRep, {weight: parseFloat(newNumber)});

        this.setState({
            currentRep: changedRep
        });
    }

    closeAndSave() {
        if (this.state.completed) {
            this.props.saveNewResults(this.state.newResults, this.state.completed, () => this.closeExercise());
        } else {
            this.props.openModal({
                text: 'Sind sie sicher, dass sie die Trainingseinheit abschlienen wollen, ohne sie zu beenden?',
                title: 'Bestätigung',
                buttons: [
                    {
                        name: 'Ja',
                        click: () => {
                            this.setState({completed: true});
                            this.props.closeModal();
                            this.props.saveNewResults(this.state.newResults, this.state.completed, () => this.closeExercise());
                        }
                    },
                    {
                        name: 'Nein',
                        click: () => closeModal()
                    },
                ]
            });
        }
    }

    enterResultsHandler() {
        let s = this.state,
            cRep = s.currentRep,
            rep = cRep.repetition,
            changedResult = s.newResults.slice();

        changedResult[rep - 1] = Object.assign({}, s.newResults[rep - 1], {reps: cRep.reps, weight: cRep.weight})

        if (this.props.details.repetitions > rep) {
            this.setState({
                newResults: changedResult,
                currentRep: Object.assign({}, cRep, {repetition: rep + 1})
            });
        } else {
            this.setState({
                newResults: changedResult,
                completed: true
            });
        }
    }

    openExercise() {
        this.setState({
            display: 'full'
        });

        this.props.hideAll();
    }

    closeExercise() {
        this.setState({
            display: 'minified'
        });

        this.props.showAll();
    }

    render() {
        if (this.props.hide && this.state.display !== 'full') {
            return null;
        }

        switch(this.state.display) {
        case 'minified':
            return React.createElement(
                'div',
                {
                    className: "exercise minified pointer" + (this.state.completed ? ' completed' : ''),
                    onClick: () => this.openExercise()
                },
                React.createElement(
                    'div',
                    {className: 'imageContainer'},
                    React.createElement(
                        'img',
                        {
                            className: 'exerciseImage',
                            src: this.props.details.imageUrl
                        }
                    )
                ),
                React.createElement(
                    'h3',
                    null,
                    (this.props.details.machine ? (this.props.details.machine + ' - ') : '') + this.props.details.name
                )
            );

        case 'full':
            return React.createElement(
                'div',
                {className: "exercise" + (this.state.completed ? ' completed' : '')},
                React.createElement(
                    'div',
                    {className: "row"},
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'img',
                            {
                                className: 'exerciseImage',
                                src: this.props.details.imageUrl
                            }
                        )
                    ),
                    React.createElement(
                        details,
                        {details: this.props.details}
                    )
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h3',
                        null,
                        'Vergangene Trainingseinheiten',
                    ),
                    React.createElement(
                        'table',
                        {className: 'pastResults'},
                        React.createElement(
                            'tbody',
                            null,
                            React.createElement(
                                resultsRow,
                                {data: this.props.pastResults[this.props.pastResults.length - 3]}
                            ),
                            React.createElement(
                                resultsRow,
                                {data: this.props.pastResults[this.props.pastResults.length - 2]}
                            ),
                            React.createElement(
                                resultsRow,
                                {data: this.props.pastResults[this.props.pastResults.length - 1]}
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h3',
                        null,
                        'Heutige Trainingseinheit',
                    ),
                    React.createElement(
                        'table',
                        {className: 'newResults'},
                        React.createElement(
                            'tbody',
                            null,
                            React.createElement(
                                resultsRow,
                                {
                                    data: this.state.newResults
                                }
                            )
                        )
                    ),
                    React.createElement(
                        enterResults,
                        {
                            currentReps: this.state.currentRep.reps,
                            currentWeight: this.state.currentRep.weight,
                            changedReps: (newNumber) => this.changedReps(newNumber),
                            changedWeight: (newNumber) => this.changedWeight(newNumber),
                            repetition: this.state.currentRep.repetition,
                            enterResults: () => this.enterResultsHandler(),
                            completed: this.state.completed
                        }
                    )
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'button',
                        {
                            className: 'fullWidthButton',
                            onClick: () => this.closeAndSave()
                        },
                        'Speichern und Abschließen'
                    ),
                    (!this.state.completed ? React.createElement(
                        'button',
                        {
                            className: 'fullWidthButton closeButton',
                            onClick: () => this.closeExercise()
                        },
                        'Schließen'
                    ) : null)
                )
            );
        }
    }
}

class details extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        let propertyname,
            setup = [];

        for (propertyname in this.props.details.setup) {
            setup.push(this.renderProperty(propertyname, this.props.details.setup[propertyname]));
        }

        return React.createElement(
            'div',
            null,
            React.createElement(
                'h4',
                null,
                (this.props.details.machine ? this.props.details.machine + ' - ' : '') + this.props.details.name
            ),
            React.createElement(
                'p',
                {className: 'note'},
                this.props.details.note
            ),
            React.createElement(
                'h4',
                null,
                'Einstellungen'
            ),
            React.createElement(
                'ul',
                {className: "setup"},
                setup
            )
        );
    }

    renderProperty(name, value) {
        return React.createElement(
            'li',
            {key: name},
            React.createElement(
                'span',
                null,
                name + ':'
            ),
            React.createElement(
                'span',
                null,
                value
            )
        );
    }
}

class resultsRow extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        let rep,
            cells = [];
        for (rep in this.props.data) {
            cells.push(this.renderCell(this.props.data[rep], rep));
        }

        return React.createElement(
            'tr',
            null,
            cells
        );
    }

    renderCell(data, id) {
        return React.createElement(
            'td',
            {key: id},
            React.createElement(
                'p',
                null,
                (data.reps !== undefined) ? data.reps + ' reps' : ''
            ),
            React.createElement(
                'p',
                null,
                (data.weight !== undefined) ? data.weight + 'kg' : ''
            )
        );
    }
}

class enterResults extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        let rep;

        if (this.props.completed) {
            return null;
        }

        return React.createElement(
            'div',
            {className: 'enterResults'},
            React.createElement(
                'h3',
                null,
                this.props.repetition + '. Satz'
            ),
            React.createElement(
                'div',
                {className: 'row'},
                React.createElement(
                    repInput,
                    {
                        currentReps: this.props.currentReps,
                        currentRepsChanged: (newNumber) => this.props.changedReps(newNumber)
                    }
                ),
                React.createElement(
                    weightInput,
                    {
                        currentWeight: this.props.currentWeight,
                        currentWeightChanged: (newNumber) => this.props.changedWeight(newNumber)
                    }
                )
            ),
            React.createElement(
                'button',
                {className: 'submitResults fullWidthButton', onClick: this.props.enterResults},
                'Ergebnisse eintragen'
            )
        );
    }
}

class repInput extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return React.createElement(
            'div',
            {className: 'repInput'},
            React.createElement(
                'h4',
                null,
                'Wiederholungen'
            ),
            React.createElement(
                'input',
                {
                    defaultValue: this.props.currentReps,
                    onChange: (evt) => this.props.currentRepsChanged(evt.target.value)
                }
            ),
        );
    }
}

class weightInput extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return React.createElement(
            'div',
            {className: 'weightInput'},
            React.createElement(
                'h4',
                null,
                'Gewicht'
            ),
            React.createElement(
                'input',
                {
                    defaultValue: this.props.currentWeight,
                    onChange: (evt) => this.props.currentWeightChanged(evt.target.value)
                }
            ),
        );
    }
}

class exerciseList extends React.Component {
    constructor(props) {
        super();

        this.state = {
            hideAll: false
        }
    }

    showAll() {
        this.setState({
            hideAll: false
        });
    }


    hideAll() {
        this.setState({
            hideAll: true
        });
    }

    render() {
        let ex,
            exerciseList = [];

        if (!this.props.show) {
            return null;
        }

        for (ex in this.props.exercises) {
            exerciseList.push(React.createElement(
                exercise,
                {
                    details: this.props.exercises[ex].details,
                    pastResults: this.props.exercises[ex].pastResults,
                    key: ex,
                    hide: this.state.hideAll,
                    hideAll: () => this.hideAll(),
                    showAll: () => this.showAll(),
                    openModal: this.props.openModal,
                    closeModal: this.props.closeModal,
                    saveNewResults: this.props.saveNewResults,

                }
            ));
        }


        return React.createElement(
            'div',
            {className: 'exerciseList' + (this.state.hideAll ? '' : ' minimized')},
            exerciseList
        );
    }
}

/*-----------------------------------------------------------------
-------------------------- Exercise End ---------------------------
-----------------------------------------------------------------*/

class dialog extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        if (!this.props.opts.showDialog) {
            return null;
        }

        let buttonList = this.props.opts.buttons.map((button, index) => {
            return React.createElement('button', {
                    onClick: (evt) => button.click(evt),
                    key: index,
                    className: 'dialogButton'
                },
                button.name);
        });

        return React.createElement(
            'div',
            {className: 'dialogBackdrop'},
            React.createElement(
                'div',
                {className: 'dialog'},
                React.createElement(
                    'div',
                    {className: 'dialogHeader row'},
                    React.createElement(
                        'h3',
                        {className: 'dialogHeadline'},
                        this.props.opts.title ? this.props.opts.title : ''
                    ),
                    React.createElement(
                        'span',
                        {
                            className: 'fa fa-window-close-o dialogCloseButton pointer',
                            onClick: this.props.close
                        }
                    )
                ),
                React.createElement(
                    'div',
                    {className: 'dialogBody'},
                    this.props.opts.text
                ),
                React.createElement(
                    'div',
                    {className: 'dialogFooter'},
                    buttonList
                )
            )
        );
    }
}

class menu extends React.Component {
    constructor(props) {
        super();
        this.state ={
            open: false
        };


    }

    _handleDocumentClick(evt) {
        if (!event.path.filter(elem => (elem.classList && elem.classList.contains('menu'))).length) {
            this.setState({open: !this.state.open});
            document.querySelector('html').removeEventListener('click', this._handleDocumentClickBind);
        }
    }

    renderMenuEntry(opt) {
        return React.createElement(
            'li',
            {
                onClick: () => opt.action(),
                className: 'pointer'
            },
            React.createElement(
                'span',
                {className: 'fa margin-right ' + opt.iconClass}
            ),
            React.createElement(
                'span',
                null,
                opt.text
            )
        )
    }


    render() {
        if (!this.props.showMenu) {
            return null;
        }


        return React.createElement(
            'div',
            {className: 'menu ' + (this.state.open ? 'open' : '') },
            (true ? React.createElement(
                'span',
                {
                    className: 'menuName',
                },
                null,
                'Menu'
            ) : null),
            React.createElement(
                'span',
                {
                    className: 'fa fa-bars fa-lg menuButton pointer',
                    onClick: () => {
                        this.setState({open: !this.state.open});
                        if (!this.state.open) {
                            this._handleDocumentClickBind = this._handleDocumentClick.bind(this)
                            document.querySelector('html').addEventListener('click', this._handleDocumentClickBind);
                        } else {
                            document.querySelector('html').removeEventListener('click', this._handleDocumentClickBind);
                        }
                    }
                }
            ),
            React.createElement(
                'ul',
                {className: 'menuList'},
                this.renderMenuEntry({
                    iconClass: 'fa-cog fa-lg',
                    action: () => {},
                    text: 'Einstellungen'
                }),
                this.renderMenuEntry({
                    iconClass: 'fa-user fa-lg',
                    action: () => {},
                    text: 'Profil'
                }),
                this.renderMenuEntry({
                    iconClass: 'fa-list fa-lg',
                    action: () => {},
                    text: 'Trainingspläne'
                }),
                this.renderMenuEntry({
                    iconClass: 'fa-sign-out fa-lg',
                    action: () => {},
                    text: 'Abmelden'
                })
            )
        );
    }
}

class topbar extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        if (this.props.opts.hideTopbar) {
            return null;
        }

        return React.createElement(
            'div',
            {className: 'topbar row'},
            React.createElement(
                'button',
                {className: 'topbarButton pointer'},
                'Zurück'
            )/*,
            React.createElement(
                profile,
                {className: ''}
            )*/,
            React.createElement(
                menu,
                {
                    className: '',
                    showMenu: true
                }
            )
        );
    }
}



class app extends React.Component {
    constructor(props) {
        super();

        this.state = {
            currentPage: 'menu',
            dialogOptions: {
                showDialog: false
            }
        }
    }

    openModal(opt) {
        this.setState({
            dialogOptions: {
                showDialog: true,
                text: opt.text ? opt.text : '',
                title: opt.title ? opt.title : '',
                buttons: opt.buttons ? opt.buttons : [{
                    name: "Schließen",
                    click: () => this.closeModal()
                }]
            }
        });
    }

    closeModal() {
        this.setState({
            dialogOptions: {
                showDialog: false
            }
        });
    }

    render() {
        return React.createElement(
            'div',
            {className: 'appRoot'},

            React.createElement(
                topbar,
                {
                    opts: {
                        hideTopbar: false
                    }
                }
            ),

            React.createElement(
                dialog,
                {
                    opts: this.state.dialogOptions,
                    close: () => this.closeModal()
                }
            ),

            React.createElement(
                exerciseList,
                {
                    openModal: (opt) => this.openModal(opt),
                    closeModal: (opt) => this.closeModal(opt),
                    saveNewResults: (a, b, c) => {
                        console.log('saved: ', a, b);
                        c();
                    },
                    show: true,
                    exercises:[{
                            details: {
                                imageUrl: "./images/situp.jpg",
                                machine: 'V18',
                                name: 'Butterfly',
                                note: 'Arme nach innen drücken',
                                setup: {
                                    'Sitz' : 3,
                                    'Lehne' : 5
                                },
                                repetitions: 3
                            },
                            pastResults: [
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}],
                                [{reps: 16, weight: 15},{reps: 16, weight: 15},{reps: 16, weight: 15}],
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}],
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}]
                            ],
                        }, {
                            details: {
                                imageUrl: "./images/situp.jpg",
                                machine: 'V18',
                                name: 'Butterfly',
                                note: 'Arme nach innen drücken',
                                setup: {
                                    'Sitz' : 3,
                                    'Lehne' : 5
                                },
                                repetitions: 3
                            },
                            pastResults: [
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}],
                                [{reps: 16, weight: 15},{reps: 16, weight: 15},{reps: 16, weight: 15}],
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}],
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}]
                            ]
                        }, {
                            details: {
                                imageUrl: "./images/situp.jpg",
                                machine: 'V18',
                                name: 'Butterfly',
                                note: 'Arme nach innen drücken',
                                setup: {
                                    'Sitz' : 3,
                                    'Lehne' : 5
                                },
                                repetitions: 3
                            },
                            pastResults: [
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}],
                                [{reps: 16, weight: 15},{reps: 16, weight: 15},{reps: 16, weight: 15}],
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}],
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}]
                            ]
                        }, {
                            details: {
                                imageUrl: "./images/situp.jpg",
                                machine: 'V18',
                                name: 'Butterfly',
                                note: 'Arme nach innen drücken',
                                setup: {
                                    'Sitz' : 3,
                                    'Lehne' : 5
                                },
                                repetitions: 3
                            },
                            pastResults: [
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}],
                                [{reps: 16, weight: 15},{reps: 16, weight: 15},{reps: 16, weight: 15}],
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}],
                                [{reps: 18, weight: 12},{reps: 20, weight: 12},{reps: 16, weight: 12}]
                            ]
                        }
                    ]
                }
            )
        );
    }
}




document.addEventListener("DOMContentLoaded", function(event) {
    ReactDOM.render(
        React.createElement(
            app,
            null
        ),
        document.getElementById('root')
    );
});