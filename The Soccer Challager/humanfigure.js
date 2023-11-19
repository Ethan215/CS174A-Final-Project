import {defs, tiny} from './examples/common.js';
import {Body, Test_Data} from './examples/collisions-demo.js';
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;
const { Triangle, Square, Tetrahedron, Torus, Windmill, Cube, Subdivision_Sphere, Cylindrical_Tube, 
        Textured_Phong, Capped_Cylinder, Textured_Phong_text, Phong_Shader, Regular_2D_Polygon } = defs;

const backgroundMusic = new Audio('path/to/your/music/file.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.play();

export class Main extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        super();

        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#A1B8D6"),
                ambient: .52, diffusivity: .1, specularity: 0.1,
                texture: new Texture("assets/blue.png")
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .1, diffusivity: .8, specularity: 0.5,
                texture: new Texture("assets/net21.png")
            }),
            net: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .5, diffusivity: .1, specularity: 0.1,
                texture: new Texture("assets/net21.png")
            }),
            sky: new Material(new Textured_Phong(), {
                color: hex_color("#A1B8D6"),
                ambient: .5, diffusivity:.1, specularity: 0.1,
                texture: new Texture("assets/sky.png"),
            }),
            blank: new Material(new Textured_Phong(), {
                color: hex_color("#edef00"),
                ambient: .5, diffusivity: 1, specularity: .1,
                texture: new Texture("assets/white.jpeg")
            })
        }
        this.shapes = {
            tube: new Cylindrical_Tube(1, 20),
            human: new HumanFigure(this.materials.phong),
            net: new soccerNet(this.materials.texture),
            poly: new Regular_2D_Polygon(4, 2),
            box: new Cube(),
            block: new Block1(this.materials.phong),
            chick: new Chick(this.materials.blank),
            chicken:new Chicken(this.materials.blank),
            ground: new Regular_2D_Polygon(100,100),
            test: new Body(new Chick(this.materials.blank), this.materials.blank, vec3(3.8,7.5,2)),
            test2: new Body(new HumanFigure(this.materials.phong), this.materials.phong, vec3(3.8,7.5,2)),
            test3: new Body(new Cube(), this.materials.phong, vec3(2, 2, 2)),
            box2: new Te(this.materials.blank)


        }
        //console.log(this.shapes.box_1.arrays.texture_coord)

        this.moving = false
        this.forward = true
        this.back = false
        this.left = false
        this.stop = false
        this.right = false
        this.firstclick = true
        this.face = "forward"
        this.model_transform = Mat4.identity()
        this.model_transform_init = Mat4.identity()
        this.model_transform_left = this.model_transform_init.times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
        this.model_transform_right = this.model_transform_init.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
        this.model_transform_back = this.model_transform_init.times(Mat4.rotation(Math.PI, 0, 1, 0))


        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));


        // background_music
        this.backgroundMusic = new Audio('music/background_music.mp3');
        this.backgroundMusic.loop = true;
    }
    make_control_panel() {
        // Use the direction buttons to control the human figure
        // update the face to keep track of the current direction
        // Only rotate when the button is first clicked
        this.key_triggered_button("Toggle Music", ["m"], () => {
            this.toggleMusic();
        });
        this.key_triggered_button("Move Forward", ["ArrowUp"], () => {
            this.moving = true
            this.forward = true
            console.log(this.face)
            if (this.firstclick == true) {
                if (this.face == "forward") {this.model_transform = this.model_transform_init}
                if (this.face == "left") {this.model_transform = this.model_transform_left}
                if (this.face == "right") {this.model_transform = this.model_transform_right}
                if (this.face == "back") {this.model_transform = this.model_transform_back}
                this.firstclick = false
            }
            this.face = "forward"
            this.shapes.human.fb = true
            
            
        }, undefined, () => {
            this.moving = false
            this.forward = false
            this.firstclick = true
        });

        this.key_triggered_button("Move Backward", ["ArrowDown"], () => {
            this.moving = true
            this.back = true
            if (this.firstclick == true) {
                if (this.face == "forward") {this.model_transform = this.model_transform_back}
                if (this.face == "right") {this.model_transform = this.model_transform_left}
                if (this.face == "left") {this.model_transform = this.model_transform_right}
                if (this.face == "back") {this.mdoel_transform = this.model_transform_init}
            this.firstclick = false
        }
        this.face = "back"
        this.shapes.human.fb = true


        }, undefined, () => {
            this.moving = false
            this.back = false
            this.firstclick = true
        });

        this.key_triggered_button("Move Left", ["ArrowLeft"], () => {
            this.moving = true
            this.left = true
            if (this.firstclick == true) {
                if (this.face == "forward") {this.model_transform = this.model_transform_right}
                if (this.face == "right") {this.model_transform = this.model_transform_back}
                if (this.face == "back") {this.model_transform = this.model_transform_left}
                if (this.face == "left") {this.mdoel_transform = this.model_transform_init}
                this.firstclick = false
            }
            this.face = "left"
            this.shapes.human.fb = false
        }, undefined, () => {
            this.moving = false
            this.left = false
            this.firstclick = true
        });

        this.key_triggered_button("Move Right", ["ArrowRight"], () => {
            this.moving = true
            this.right = true
            if (this.firstclick == true) {
                if (this.face == "forward") {this.model_transform = this.model_transform_left}
                if (this.face == "left") {this.model_transform = this.model_transform_back}
                if (this.face == "back") {this.model_transform = this.model_transform_right}
                if (this.face == "right") {this.mdoel_transform = this.model_transform_init}
                this.firstclick = false
            }
            this.face = "right"
            this.shapes.human.fb = false
        }, undefined, () => {
            this.moving = false
            this.right = false
            this.firstclick = true
        });

    }
    // controal the background_music
    playMusic() {
        this.backgroundMusic.play().catch(e => console.error("Error playing music:", e));
    }
    pauseMusic() {
        this.backgroundMusic.pause();
    }
    toggleMusic() {
        if (this.backgroundMusic.paused) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }
    }


    move_human_figure(direction=1, shouldSwing, program_state) {
        let current_pos = this.shapes.human.return_pos();
        let transform = this.model_transform

        this.model_transform = transform.times(Mat4.translation(0, 0,  direction*0.2))
        this.shapes.human.move(this.model_transform);

        if (shouldSwing) {
            this.shapes.human.swingArm(program_state.animation_time / 900)
            this.shapes.human.swingLeg(program_state.animation_time / 900)
        }


    }

    stop_human_figure() {
        this.shapes.human.stop_swin()
    }

    display(context, program_state) {
        //code copied from assignment4, adjust the initial camera location
        //if you dont want to move the camera location, comment the if statement but preserve program_state.set_camera
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(1, 0, -17));
        }



        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        model_transform = model_transform.times(Mat4.scale(.4, .4, .4))
                                            .times (Mat4.rotation(Math.PI, 0, 1, 0))
                                            
        //moving logic
        if (this.moving) { 
            if (this.forward && (!this.stop||this.back)) {
                this.move_human_figure(1, true, program_state)
                
                this.model_transform = this.model_transform_init
            }
            else if (this.back&&(!this.stop||this.forward)) {
                this.move_human_figure(1, true, program_state)
                this.model_transform = this.model_transform_init
            }
            else if (this.left&&(!this.stop||this.right)) {
                this.move_human_figure(1, true, program_state)
                this.model_transform = this.model_transform_init
            }
            else if (this.right&&(!this.stop||this.left)) {
                this.move_human_figure(1, true, program_state)
                this.model_transform = this.model_transform_init
            }
        }

        else {
            this.stop_human_figure()
            this.stop = false
        }
        let model_transform_human = model_transform
        //.times(Mat4.scale(0.7, 0.7, 0.7))
        .times(Mat4.translation(6, 1.45, -30))



        //draw obstacles and human
        this.shapes.human.draw(context, program_state, Mat4.identity().times(Mat4.rotation(Math.PI, 0, 1, 0)).times(Mat4.translation(5,5.3,0)), this.materials.phong)
        
        //this.shapes.tube.draw(context, program_state, model_transform_human, this.materials.texture)
        this.shapes.net.draw(context,program_state,model_transform,this.materials.texture)
        this.shapes.box.draw(context, program_state, Mat4.identity().times(Mat4.translation(0,-10,0)).times(Mat4.scale(30, 30, 30)), this.materials.sky)
        this.shapes.ground.draw(context, program_state, Mat4.identity().times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.scale(50, 50, 50)).times(Mat4.translation(0,0,1.25/50)), this.materials.blank.override({color:hex_color("82ec3c")}))
        //let x,y,z = this.shapes.human.get_pos()
        //let model_box = Mat4.identity().times(Mat4.scale(5, 5, 5)).times(Mat4.translation(x, y, z))
        this.shapes.block.draw(context, program_state, Mat4.identity().times(Mat4.scale(.3, .3, .3)).times(Mat4.translation(-2/.3, -.33/.3, 5/.3)), this.materials.phong.override({color: hex_color("#FFFF00")}))
        this.shapes.chick.draw(context, program_state, Mat4.identity().times(Mat4.scale(.3, .3, .3)).times(Mat4.translation(-5/.3, -.45/.3, 6/.3)), this.materials.phong)
        this.shapes.chicken.draw(context,program_state,Mat4.identity(), this.materials.blank)
        //this.shapes.test.emplace(Mat4.identity().times(Mat4.scale(.3, .3, .3)).times(Mat4.translation(-5/.3, -.45/.3, 6/.3)), 0, 0)
        //this.shapes.test.shape.draw(context, program_state, this.shapes.test.drawn_location, this.shapes.test.material);
        //this.shapes.test2.emplace(Mat4.identity().times(Mat4.scale(.3, .3, .3)).times(Mat4.translation(-5/.3, -.45/.3, 6/.3)), 0, 0)
        //this.shapes.test2.shape.draw(context, program_state, this.shapes.test.drawn_location, this.shapes.test.material);
        //this.shapes.test3.emplace(Mat4.identity().times(Mat4.scale(.3, .3, .3)).times(Mat4.translation(-5/.3, -.45/.3, 6/.3)), 0, 0)
        //this.shapes.test3.shape.draw(context, program_state, this.shapes.test3.drawn_location, this.shapes.test3.material);
        this.shapes.box2.draw(context,program_state,Mat4.identity())
        if (this.shapes.human.bound.intersects(this.shapes.box2.bound)) {//console.log("oops")
        //this.stop = true
        }
        else {
            this.stop = false
        }

    }
}

    //It is the updated version, bounding box is added to the constructor
    class SceneGraph{
        constructor(geometry = true, name = "", material, model_transform = Mat4.identity()) {
            this.model_transform = model_transform
            this.geometry = geometry 
            this.material = material
            this.name = name
            this.parts = []
            this.initial_center_x = [0,0,0]
            this.center_x = [0,0,0]
            this.w = 0
            this.h = 0
            this.d = 0
            this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
     }
        addParts(part){this.parts.push(part)}

        draw(context, program_state, transform = Mat4.identity()) {
            var overall_transform = transform.times(this.model_transform)
            if (this.geometry && typeof this.geometry.draw === 'function') {
                this.geometry.draw(context, program_state, overall_transform, this.material)
            } 
            for (let part of this.parts) {
                part.draw(context, program_state, overall_transform)
            }
        }

        return_pos() {
        
            return this.center_x
        }
        update_bound() {
            this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)

        }

        update_pos() {
            this.center_x[0] = this.initial_center_x[0] +this.model_transform[0][3]
            this.center_x[1] = this.initial_center_x[1] +this.model_transform[1][3]
            this.center_x[2] = this.initial_center_x[2] +this.model_transform[2][3]

            //console.log(this.center_x[0], this.center_x[1], this.center_x[2])
        }
    }
//center of human = center of the head
class HumanFigure extends SceneGraph {
    constructor(material) {
        super(true, "Humanfigure", material)
        this.leftArm = new SceneGraph(new Cube(), "LeftArm", material)
        this.rightArm = new SceneGraph(new Cube(), "RightArm", material)
        this.body = new SceneGraph(new Cube(), "Body", material)
        this.head = new Head(material)
        this.leftLeg = new SceneGraph(new Cube(), "LeftLeg", material)
        this.rightLeg = new SceneGraph(new Cube(), "RightLeg", material)
        this.fb = true
        this.w = 3.8 //abs 
        this.h = 7.5 // abs
        this.d = 1.5
        this.initial_center_x = [5, 6.5 + 5.3, 0]
        this.center_x = [5, 6.5 + 5.3, 0]
        this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
        


        this.leftArm.model_transform = this.model_transform.times(Mat4.translation(1.4, -2.2, 0))
                                                        .times(Mat4.scale(.4, 1, .3))
                                                   

        this.rightArm.model_transform = this.model_transform.times(Mat4.translation(-1.4, -2.2, 0))
                                                        .times(Mat4.scale(.4, 1, .3))
                                                        
        this.body.model_transform = this.model_transform.times(Mat4.translation(0, -2.5, 0))
                                                        .times(Mat4.scale(1, 1.5, 0.55))
        
        this.leftLeg.model_transform = this.model_transform.times(Mat4.translation(-0.5, -5, 0))
                                                        .times(Mat4.scale(0.45, 1.5, 0.4))
        this.rightLeg.model_transform = this.model_transform.times(Mat4.translation(0.5, -5, 0))
                                                        .times(Mat4.scale(0.45, 1.5, 0.4))
        this.reference = new Cube()
        this.initialLeftArmTransform = this.leftArm.model_transform.copy();
        this.initialRightArmTransform = this.rightArm.model_transform.copy();
        this.initialLeftLegTransform = this.leftLeg.model_transform.copy();
        this.initialRightLegTransform = this.rightLeg.model_transform.copy();
        this.initialHead = this.head.model_transform.copy()
        this.initialBody = this.body.model_transform.copy()

        this.addParts(this.head)
        this.addParts(this.leftArm)
        this.addParts(this.rightArm)
        this.addParts(this.body)
        this.addParts(this.leftLeg)
        this.addParts(this.rightLeg)

}
    update_pos() {
        
        super.update_pos()
    }
    update() {
        this.leftArm.model_transform = this.initialLeftArmTransform
        this.rightArm.model_transform = this.initialLeftArmTransform
        this.leftLeg.model_transform = this.initialLeftLegTransform
        this.rightLeg.model_transform = this.initialRightArmTransform
        this.head.model_transform = this.initialHead
        this.body.model_transform = this.initialBody
    }


    update_bound () {
        if (this.fb == false) {
            this.bound = new BoundingBox(this.center_x[0],this.center_x[1],this.center_x[2],this.d,this.h,this.w)
        }
        else {
            this.bound = new BoundingBox(this.center_x[0],this.center_x[1],this.center_x[2],this.w,this.h,this.d)
        }
    }
    

    move(transform) {
        this.update()
        this.update_pos()
        this.update_bound()
        
        this.model_transform = this.model_transform.times(transform);
            for (let part of this.parts) {
                part.model_transform = part.model_transform.times(transform);
            }
        this.reference.model_transform = this.model_transform
   

    }

    draw(context, program_state, transform = Mat4.identity()) {

        super.draw(context, program_state, transform, this.material.override({texture:new Texture("assets/smile.jpg")}))
    }

    swingArm(time) {

        let angle = Math.sin(2*time) * Math.PI / 6; 

        this.leftArm.model_transform = this.initialLeftArmTransform
            .times(Mat4.scale(1/.4, 1, 1/.3))
            .times(Mat4.translation(1.4, 1, 0))
            .times(Mat4.rotation(angle, 1, 0, 0))
            .times(Mat4.translation(-1.4, -1, 0))
            .times(Mat4.scale(.4, 1, .3))

        this.rightArm.model_transform = this.initialRightArmTransform
            .times(Mat4.scale(1/.4, 1, 1/.3))
            .times(Mat4.translation(-1.4, 1, 0))
            .times(Mat4.rotation(-angle, 1, 0, 0))
            .times(Mat4.translation(1.4, -1, 0))
            .times(Mat4.scale(.4, 1, .3))

    }
    swingLeg(time) {
        let angle = Math.sin(2* time) * Math.PI / 8; 

        this.leftLeg.model_transform = this.initialLeftLegTransform
            .times(Mat4.scale(1/.45, 1/1.5, 1/.4))
            .times(Mat4.translation(0.5, 2, 0))
            .times(Mat4.rotation(angle, 1, 0, 0))
            .times(Mat4.translation(-0.5, -2, 0))
            .times(Mat4.scale(.45, 1.5, .4))

        this.rightLeg.model_transform = this.initialRightLegTransform
        .times(Mat4.scale(1/.45, 1/1.5, 1/.4))
        .times(Mat4.translation(-0.5, 2, 0))
        .times(Mat4.rotation(-angle, 1, 0, 0))
        .times(Mat4.translation(0.5, -2, 0))
        .times(Mat4.scale(.45, 1.5, .4))


    }
    stop_swin() {
        this.leftArm.model_transform = this.initialLeftArmTransform;
        this.rightArm.model_transform = this.initialRightArmTransform;
        this.leftLeg.model_transform = this.initialLeftLegTransform;
        this.rightLeg.model_transform = this.initialRightLegTransform;

    }
}

class Head extends SceneGraph {
    constructor(material) {
        super(false, "Head", material); 
        this.main = new SceneGraph(new defs.Subdivision_Sphere(4), "Main", material)
        this.leye = new SceneGraph(new defs.Subdivision_Sphere(4), "LeftEye", material.override({color: hex_color("#000000")}))
        this.reye = new SceneGraph(new defs.Subdivision_Sphere(4), "RightEye", material.override({color: hex_color("#000000")}))
        this.transform = Mat4.identity()

        this.basicArrange()
        this.addParts(this.main)
        this.addParts(this.leye)
        this.addParts(this.reye)
    }
    basicArrange() {
        this.main.model_transform = this.model_transform.times(Mat4.scale(1, 1, 1))
                                                        .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
            
        this.leye.model_transform = this.model_transform.times(Mat4.translation(-0.3, 0.1, 0.8))
                                        .times(Mat4.scale(0.1, 0.2, 0.2));
        this.reye.model_transform = this.model_transform.times(Mat4.translation(0.3, 0.1, 0.8))
                                        .times(Mat4.scale(0.1, 0.2, 0.2)); 
    }
    draw(context, program_state, transform) {
        // Draw the main part and eyes
        super.draw(context, program_state, transform, this.material)
    
        
    }


}
//current center of soccerNet = center of rod1
class soccerNet extends SceneGraph {
    constructor(material) {
        super(false, 'net', material)
        this.rod1 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod1",  material.override({texture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod2 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod2", material.override({texture: new Texture("assets/iron.jpg"),ambient:.3}) ) 
        this.rod3 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod3",  material.override({texture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod4 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod4",  material.override({ctexture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod5 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod5",  material.override({ctexture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod6 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod6", material.override({ctexture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod7 = new SceneGraph(new Cylindrical_Tube(5, 200), "rod7",  material.override({ctexture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod8 = new SceneGraph(new Cylindrical_Tube(5, 200), "rod8",  material.override({ctexture: new Texture("assets/iron.jpg"), ambient:.3}))
        this.face1 = new SceneGraph(new Cube(), "face1", material.override({ambient:.3}))
        this.face2 = new SceneGraph(new Triangle(), "face2", material.override({ambient:.3}))
        this.face3 = new SceneGraph(new Triangle(), "face3", material.override({ambient:.3}))
        this.collision_bound = new Cube()
        this.reference = new Cube()

        this.basicArrange()
        
        this.addParts(this.rod1)
        this.addParts(this.rod2)
        this.addParts(this.rod3)
        this.addParts(this.rod4)
        this.addParts(this.rod5)
        this.addParts(this.rod6)
        this.addParts(this.rod7)
        this.addParts(this.rod8)
        this.addParts(this.face1)
        this.addParts(this.face2)
        this.addParts(this.face3)
    }

    basicArrange() {
        //这个rod很诡异，先scale再rotate会变成奇怪的东西
    this.rod1.model_transform = Mat4.identity()
    .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
    .times(Mat4.scale(0.3, 0.3, 6))
    this.rod2.model_transform = Mat4.identity()
    .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
    .times(Mat4.scale(0.3, 0.3, 6))
    .times(Mat4.translation(12 * (1/0.3), 0, 0))

    this.rod3.model_transform = Mat4.identity()
    .times(Mat4.translation(0, -2.8, 3.8))
    .times(Mat4.scale(0.3, 0.3, 8));

    this.rod4.model_transform = Mat4.identity()
    .times(Mat4.translation(12, -2.8, 3.8))
    .times(Mat4.scale(0.3, 0.3, 8));

    this.rod5.model_transform = Mat4.identity()
    
    .times(Mat4.rotation(0.6435, 1, 0, 0))
    .times(Mat4.scale(0.3, 0.3, 10))
    .times(Mat4.translation(0, 8, .3));

    this.rod6.model_transform = Mat4.identity()
    .times(Mat4.rotation(0.6435, 1, 0, 0))
    .times(Mat4.scale(0.3, 0.3, 10))
    .times(Mat4.translation(12/.3, 8, .3));

    this.rod7.model_transform = Mat4.identity()
    .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
    .times(Mat4.scale(0.3, 0.3, 12))
    .times(Mat4.translation(0, 2.8/0.3, .5))

    this.rod8.model_transform = Mat4.identity()
    .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
    .times(Mat4.scale(0.3, 0.3, 12))
    .times(Mat4.translation(-7.6/0.3, -2.8/0.3, .5))

    this.face1.model_transform = Mat4.identity()
    //.times(Mat4.scale(1, 1, 0.01))
    //.times(Mat4.translation(1, 0, 0))
    .times(Mat4.rotation(-0.92729, 1, 0, 0))
    .times(Mat4.scale(6,4.75,0.01)) 
    .times(Mat4.translation(1, -.6, 250))
   

    this.face2.model_transform = Mat4.identity()
    .times(Mat4.scale(1, 6, -8))
    .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
    .times(Mat4.translation(0, -0.5, 0))

    this.face3.model_transform = Mat4.identity()
    .times(Mat4.scale(1, 6, -8))
    .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
    .times(Mat4.translation(0, -.5, 12))



    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
        
    }
}
//current center of Block1 = center of rod1
class Block1 extends SceneGraph {
    constructor(material) {
        super(false, "block1", material)
        this.rod1 = new SceneGraph(new Capped_Cylinder(5, 100), "rod11",  this.material.override({texture: new Texture("assets/iron.jpg"), specularity:.1}))
        this.rod2 = new SceneGraph(new Capped_Cylinder(5, 100), "rod21",  this.material.override({texture: new Texture("assets/iron.jpg"), specularity:.1}))
        this.face1 = new SceneGraph(new Cube(), "face1", material)
        this.face2 = new SceneGraph(new Cube(), "face2", material)

        this.basicArrange()
        this.addParts(this.rod1)
        this.addParts(this.rod2)
        this.addParts(this.face1)
        this.addParts(this.face2)

    }
    basicArrange() {
        this.rod1.model_transform = Mat4.identity()
        .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
        .times(Mat4.scale(0.3,0.3,6))
        this.rod2.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 1, 0, 0))
                                .times(Mat4.scale(0.3,0.3,6))
                                .times(Mat4.translation(10/0.3, 0, 0))
                                //cube default length = 2
        this.face1.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/24, 0, 0, 1))
                                                    .times(Mat4.scale(5/0.99,1,0.01))
                                                    .times(Mat4.rotation(-Math.PI/128, 0, 0, 1))
                                                    .times(Mat4.translation(1, 0.3, 0))
        this.face2.model_transform = Mat4.identity().times(Mat4.rotation(-Math.PI/12, 0, 0, 1))
                                                    .times(Mat4.scale(5/0.96,0.5,0.01))
                                                    .times(Mat4.rotation(Math.PI/128, 0, 0, 1))
                                                    .times(Mat4.translation(1, 3/0.8, -1))                                           

    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
        
    }
}
//center of chicken the center of the first chick
class Chicken extends SceneGraph{
    constructor(material) {
        super(false, "group", material)
        this.first = new Chick(material)
        this.second = new Chick(material)
        this.third = new Chick(material)

        this.basicArrange()
        this.addParts(this.first)
        this.addParts(this.second)
        this.addParts(this.third)
    }
    basicArrange() {
        this.first.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.scale(.3, .3, .3)).times(Mat4.translation(-9/.3, -.45/.3, -4/.3))
        this.second.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.scale(.3, .3, .3)).times(Mat4.translation(-9/.3, -.45/.3, -2.5/.3))
        this.third.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.scale(.3, .3, .3)).times(Mat4.translation(-9/.3, -.45/.3, -1/.3))

    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
    }

}

//center of chick is center of head
class Chick extends SceneGraph {
    constructor(material) {
        super(false, "chick", material)
        this.head = new SceneGraph(new Head(material), "head",  material)
        this.body = new SceneGraph(new Cube(), "body", material)
        this.body2= new SceneGraph(new Cube(), "body2", material)
        this.body3 = new SceneGraph(new Cube(), "body3", material)
        this.body4 = new SceneGraph(new Cube(), "body4", material)
        this.body5 = new SceneGraph(new Cube(), "body5", material)
        this.mouse = new SceneGraph(new Cube(), "mouse", material.override({color: hex_color ('#C96303')}))
        this.wing1 =new SceneGraph(new Cube(), "wing1", material.override({color: hex_color('#ebc600')}))
        this.wing2= new SceneGraph(new Cube(), "wing2", material.override({color: hex_color('#ebc600')}))
        this.head_addon =new SceneGraph(new Cube(), "addon", material.override({color: hex_color ('#B90007')}))
        this.head_addon2 =new SceneGraph(new Cube(), "addon", material.override({color: hex_color ('#B90007')}))
        this.leg1 = new SceneGraph(new Cube(), "mouse", material)
        this.leg2= new SceneGraph(new Cube(), "mouse", material)
        this.feet1= new SceneGraph(new Cube(), "mouse", material.override({color: hex_color ('#C96303')}))
        this.feet2= new SceneGraph(new Cube(), "mouse", material.override({color: hex_color ('#C96303')}))


        this.basicArrange()
        this.addParts(this.head)
        this.addParts(this.body)
        this.addParts(this.body2)
        this.addParts(this.mouse)
        this.addParts(this.body3)
        this.addParts(this.body4)
        this.addParts(this.wing1)
        this.addParts(this.wing2)
        this.addParts(this.leg1)
        this.addParts(this.leg2)
        this.addParts(this.feet1)
        this.addParts(this.feet2)
        this.addParts(this.head_addon)
        this.addParts(this.head_addon2)

    }
    basicArrange() {
        this.head.model_transform = Mat4.identity()     
        this.head_addon.model_transform = Mat4.identity().times(Mat4.rotation(-Math.PI/6, 1, 0, 0))
                                                            .times(Mat4.scale(.1, .3, .1))
                                                            .times(Mat4.translation(0, 1/0.3, .4/.1))
        this.head_addon2.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/6, 1, 0, 0))
                                                            .times(Mat4.scale(.1, .3, .1))
                                                            .times(Mat4.translation(0, 1/0.3, -.3/.1)) 
                                                         
        this.body.model_transform = Mat4.identity().times(Mat4.scale(1, .8, 1))    
                                                    .times(Mat4.translation(0, -1.2/.8, -1))
        this.body2.model_transform = Mat4.identity().times(Mat4.scale(.6, .5, .2))    
                                                    .times(Mat4.translation(0, -1.4/.5, 1))
        this.body3.model_transform = Mat4.identity().times(Mat4.scale(.7, .8, .3))    
                                                    .times(Mat4.translation(0, -1/.8, -2.3/.3))
        this.body4.model_transform = Mat4.identity().times(Mat4.scale(.5, .6, .2))    
                                                    .times(Mat4.translation(0, -.7/.6, -2.8/.2))
        this.mouse.model_transform = Mat4.identity().times(Mat4.scale(.3, .2, .4))    
                                                    .times(Mat4.translation(0, -0.8, 1/.4))
                                                    
        this.wing1.model_transform = Mat4.identity().times(Mat4.scale(.2, .4, .5))    
                                                    .times(Mat4.translation(1/.2, -1.2/.4, -1/.5))
        this.wing2.model_transform = Mat4.identity().times(Mat4.scale(.2, .4, .5))    
                                                    .times(Mat4.translation(-1/.2, -1.2/.4, -1/.5))
        this.leg1.model_transform = Mat4.identity().times(Mat4.scale(.2, .3, .1))
                                                    .times(Mat4.translation(-.5/.2, -2.2/.3, -.7/.1))
        this.leg2.model_transform = Mat4.identity().times(Mat4.scale(.2, .3, .1))
                                                    .times(Mat4.translation(.5/.2, -2.2/.3, -.7/.1))
        this.feet1.model_transform = Mat4.identity().times(Mat4.scale(.3, .1, .3))
                                                    .times(Mat4.translation(.5/.3, -2.5/.1, -.6/.3))
        this.feet2.model_transform = Mat4.identity().times(Mat4.scale(.3, .1, .3))
                                                    .times(Mat4.translation(-.5/.3, -2.5/.1, -.6/.3))

    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
        
    }
}



class BoundingBox {
    //x, y ,z is the center of the obj
    constructor(x, y, z, width, height, depth) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.height = height;
        this.depth = depth;
    }

    // check if intersects
    intersects(other) {
        //console.log(this.x + other.x, this.width/2 + other.width/2, this.z + other.z, this.depth/2+ other.depth/2)
        return ((Math.abs(this.x) + Math.abs(other.x) <= this.width/2 + other.width/2 &&
        Math.abs(this.z) + Math.abs(other.z) <= this.depth/2 + other.depth/2)
        )
    }}
//this is the class for testing the collision
class Te extends SceneGraph {
    constructor(material) {
        super(false, 'te', material)
        this.c = new SceneGraph(new Cube(), 'a', this.material)
        this.addParts(this.c)
        this.w = 2
        this.d = 2
        this.h = 2
        this.c.model_transform - Mat4.identity()
        this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
        
    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
        
    }
}

